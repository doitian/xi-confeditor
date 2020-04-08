package com.sanpj.pets.confeditor.app

import com.sanpj.pets.confeditor.view.LaunchView
import javafx.application.Platform
import javafx.stage.Stage
import tornadofx.*

class MyApp: App(LaunchView::class, Styles::class) {
    override fun start(stage: Stage) {
        super.start(stage)
        stage.setOnCloseRequest { event ->
            val launchView = find(LaunchView::class)
            launchView.shutdown()
            Platform.exit();
            System.exit(0);
        }
    }
}
