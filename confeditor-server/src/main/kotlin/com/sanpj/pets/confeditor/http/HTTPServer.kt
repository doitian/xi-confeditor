package com.sanpj.pets.confeditor.http

import com.github.salomonbrys.kotson.jsonArray
import com.github.salomonbrys.kotson.jsonObject
import com.google.gson.GsonBuilder
import com.sanpj.pets.confeditor.repo.ExcelFileChanges
import com.sanpj.pets.confeditor.repo.ExcelRepo
import org.jetbrains.ktor.application.*
import org.jetbrains.ktor.content.*
import org.jetbrains.ktor.features.DefaultHeaders
import org.jetbrains.ktor.features.StatusPages
import org.jetbrains.ktor.host.BaseApplicationHost
import org.jetbrains.ktor.host.embeddedServer
import org.jetbrains.ktor.http.ContentType
import org.jetbrains.ktor.http.HttpStatusCode
import org.jetbrains.ktor.logging.CallLogging
import org.jetbrains.ktor.jetty.Jetty
import org.jetbrains.ktor.pipeline.runAsync
import org.jetbrains.ktor.request.acceptItems
import org.jetbrains.ktor.response.contentType
import org.jetbrains.ktor.response.respondText
import org.jetbrains.ktor.routing.*
import org.jetbrains.ktor.transform.transform
import org.jetbrains.ktor.util.nextNonce
import org.jetbrains.ktor.websocket.Frame
import org.jetbrains.ktor.websocket.WebSocket
import org.jetbrains.ktor.websocket.readText
import org.jetbrains.ktor.websocket.webSocket
import java.awt.Desktop
import java.io.File
import java.io.InputStream
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class HTTPServer(
        var confDirectory: String = "",
        var port: Int = 5000
) {
    class JsonResponse(val data: Any)

    private var server: BaseApplicationHost? = null
    private var executor: ExecutorService? = null

    val running
        get() = server != null

    fun start() {
        if (server != null) return

        server = embeddedServer(Jetty, port, module=this::build).start(wait=false)
        executor = Executors.newSingleThreadExecutor()
    }

    fun stop() {
        server?.stop(300, 10000, TimeUnit.MICROSECONDS)
        server = null

        try {
            executor?.shutdown()
        } finally {
            executor?.shutdownNow()
        }
        executor = null
    }

    private fun build(app: Application) {
        val gson = GsonBuilder().create()
        val repo = ExcelRepo(confDirectory)
        var sockets = ConcurrentHashMap<String, WebSocket>();

        with(app) {
            install(DefaultHeaders)
            install(CallLogging)
            install(StatusPages) {
                exception(Exception::class.java) { ex ->
                    if (call.request.acceptItems().any { it.value == "application/json" }) {
                        log.error(ex)
                        call.response.status(HttpStatusCode.InternalServerError)
                        call.respond(JsonResponse(jsonObject(
                                "code" to 500,
                                "error" to ex.toString()
                        )))
                    }
                }
            }
            intercept(ApplicationCallPipeline.Infrastructure) { call ->
                if (call.request.acceptItems().any { it.value == "application/json" }) {
                    call.transform.register<JsonResponse> { value ->
                        TextContent(gson.toJson(value.data), ContentType.Application.Json)
                    }
                }
            }
            routing {
                static {
                    staticRootFolder = File(confDirectory)
                    default("index.html")
                    files(".")
                }

                webSocket("/ws") {
                    val id = nextNonce()
                    sockets.put(id, this)

                    pingInterval = Duration.ofMinutes(1)

                    handle {
                        if (it is Frame.Text) {
                            log.info("${id} <- ${it.readText()}");
                        }
                    }

                    close {
                        sockets.remove(id);
                    }
                }

                route("api") {
                    get("/excel") {
                        val names = File(confDirectory).listFiles { path ->
                            val lowerName = path.name.toLowerCase()
                            !lowerName.startsWith("~") && (lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx"))
                        }.map {
                            it.nameWithoutExtension
                        }

                        call.response.contentType(ContentType.Application.Json)
                        call.respond(JsonResponse(jsonObject(
                                "names" to jsonArray(names)
                        )))
                    }

                    get("/excel/{name}") {
                        val fileName = call.parameters["name"]!!
                        runAsync(executor!!) {
                            val file = repo.read(fileName)
                            call.response.contentType(ContentType.Application.Json)
                            if (file != null) {
                                call.respond(JsonResponse(file))
                            } else {
                                call.response.status(HttpStatusCode.NotFound)
                                call.respond(JsonResponse(jsonObject(
                                        "code" to 404,
                                        "error" to "文件 ${fileName} 不存在"
                                )))
                            }
                        }
                    }

                    post("/excel/{name}") {
                        val fileName = call.parameters["name"]!!
                        var bodyReader = call.request.receive<InputStream>().reader(Charsets.UTF_8);
                        val changes = gson.fromJson(bodyReader, ExcelFileChanges::class.java)
                        changes.name = fileName
                        runAsync(executor!!) {
                            val savedChanges = repo.save(changes)
                            call.response.contentType(ContentType.Application.Json)
                            if (savedChanges != null) {
                                call.respondText("{\"ok\":1}", ContentType.Application.Json)
                                val text = gson.toJson(savedChanges);
                                val frame = Frame.Text(text)
                                sockets.values.forEach({
                                    it.send(frame.copy())
                                })
                            } else {
                                call.response.status(HttpStatusCode.NotFound)
                                call.respond(JsonResponse(jsonObject(
                                        "code" to 404,
                                        "error" to "文件 ${fileName} 不存在"
                                )))
                            }
                        }
                    }

                    post("/excel/open/{name}") {
                        val fileName = call.parameters["name"]!!
                        var desktop: Desktop? = null
                        if (Desktop.isDesktopSupported()) {
                            desktop = Desktop.getDesktop();
                            if (desktop != null && !desktop.isSupported(Desktop.Action.OPEN)) {
                                desktop = null;
                            }
                        }

                        call.response.contentType(ContentType.Application.Json)
                        if (desktop == null) {
                            call.response.status(HttpStatusCode.NotImplemented)
                            call.respond(JsonResponse(jsonObject(
                                    "code" to 501,
                                    "error" to "不支持打开文件命令"
                            )))
                            return@post
                        }

                        val file = repo.findExcelFile(fileName)
                        if (file != null) {
                            desktop.open(file)
                            call.respondText("{\"ok\":1}", ContentType.Application.Json)
                        } else {
                            call.response.status(HttpStatusCode.NotFound)
                            call.respond(JsonResponse(jsonObject(
                                    "code" to 404,
                                    "error" to "文件 ${fileName} 不存在"
                            )))
                        }
                    }

                    delete("/excel") {
                        runAsync(executor!!) {
                            repo.clear()
                            call.respondText("{\"ok\":1}", ContentType.Application.Json)
                        }
                    }
                }
            }

        }
    }
}