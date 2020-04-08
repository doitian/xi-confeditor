package com.sanpj.pets.confeditor.viewmodel

import com.sanpj.pets.confeditor.http.HTTPServer
import javafx.beans.property.IntegerProperty
import tornadofx.*

class HTTPServerViewModel(val server: HTTPServer) : ViewModel() {
    var confDirectory = bind { server.observable(HTTPServer::confDirectory) }
    var port = bind { server.observable(HTTPServer::port) } as IntegerProperty
}