package com.sanpj.pets.confeditor.view

import com.sanpj.pets.confeditor.http.HTTPServer
import com.sanpj.pets.confeditor.viewmodel.HTTPServerViewModel
import javafx.beans.property.SimpleBooleanProperty
import javafx.geometry.Pos
import javafx.scene.layout.Priority
import tornadofx.*
import java.awt.Desktop
import java.io.File
import java.net.URI
import java.text.NumberFormat
import java.util.prefs.Preferences


class LaunchView : View("配表服务器") {
    var prefs = Preferences.userNodeForPackage(LaunchView::class.java)

    val model = HTTPServerViewModel(HTTPServer())
    val running = SimpleBooleanProperty(false)

    val desktop = if (Desktop.isDesktopSupported()
            && Desktop.getDesktop() != null
            && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
        Desktop.getDesktop()
    } else {
        null
    }

    fun shutdown() {
        model.server.stop()
    }

    override val root = vbox(10) {
        form {
            fieldset {
                field("配表目录") {
                    hbox {
                        textfield(model.confDirectory) {
                            required()
                            isDisable = true
                            hgrow = Priority.ALWAYS
                        }
                        button("...") {
                            disableProperty().bind(running)
                            action {
                                model.confDirectory.value = chooseDirectory("配表目录").toString()
                            }
                        }
                    }
                }
            }
            fieldset {
                field("端口") {
                    textfield {
                        val format = NumberFormat.getIntegerInstance()
                        format.isGroupingUsed = false
                        bind(model.port, format=format)
                        disableProperty().bind(running)
                    }
                }
            }

            hbox {
                alignment = Pos.CENTER_RIGHT
                button {
                    bind(running.stringBinding {
                        if (it != null && it) {
                            "停止"
                        } else {
                            "连接"
                        }
                    })
                    val waiting = SimpleBooleanProperty(false)
                    enableWhen { model.valid.and(waiting.not()) }
                    action {
                        model.commit {
                            waiting.value = true
                            val server = model.server
                            try {
                                if (running.value) {
                                    server.stop()
                                } else {
                                    server.start()
                                }
                                running.value = server.running
                            } finally {
                                waiting.value = false
                            }
                        }
                    }
                }

            }
        }

        if (desktop != null) {
            hbox(5) {
                paddingAll = 10
                alignment = Pos.CENTER_LEFT
                label("运行中")
                hyperlink {
                    bind(model.port.stringBinding {
                        "http://127.0.0.1:${it}"
                    })
                    action {
                        desktop.browse(URI(text))
                    }
                }
                visibleProperty().bind(running)
            }
        }
    }

    private val PREF_DIRECTORY = "DIRECTORY"
    private val PREF_PORT = "PORT"

    init {
        val dirHistory = prefs.get(PREF_DIRECTORY, "")
        if (File(dirHistory).isDirectory) {
            model.confDirectory.value = dirHistory
        }
        model.confDirectory.onChange { v ->
            prefs.put(PREF_DIRECTORY, v)
        }

        var port = prefs.getInt(PREF_PORT, model.port.value)
        model.port.value = port
        model.port.onChange { v ->
            prefs.putInt(PREF_PORT, v)
        }
    }
}