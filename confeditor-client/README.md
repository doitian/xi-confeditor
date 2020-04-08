# ConfEditor Client

项目使用 Create React App 生成，文档参考 CRA.md

需要和 [ConfEditor](https://gitlab.3pjgames.com/xi/confeditor) 配合使用。`ConfEditor` 负责读写 Excel 并启动内置 HTTP 服务器，本项目使用 API 和 React 来搭建 UI。

发布是通过 `yarn run build` 打包，在 `ConfEditor` 中指定 build 文件即可。本地开发时将 `ConfEditor` 启动在 5000 端口，然后使用 `yarn start` 启动开发服务器。

## 开始

根据不同项目，链接不同的配置文件，比如 pets

    ln -snf pets.ts config-src/config.ts

运行下面命令编译生成命令

    yarn run config

也可以使用 `configWatch` 自动编译。

配置文件请在 `config-src` 下修改。修改后需要运行 `yarn run config` 重新生成。

开发

    yarn start

发布

    yarn build
