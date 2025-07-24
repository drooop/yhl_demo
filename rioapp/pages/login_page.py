from __future__ import annotations

import rio

from ..services.matrix_service import MatrixService, HOMESERVER, USERNAME, PASSWORD

@rio.page(name="登录", url_segment="login")
class LoginPage(rio.Component):
    server: str = HOMESERVER
    username: str = USERNAME
    password: str = PASSWORD
    error: str = ""

    async def on_login(self) -> None:
        service = MatrixService(self.server, self.username, self.password)
        ok = await service.login()
        if ok:
            self.session.attach(service)
            self.session.navigate_to("/")
        else:
            self.error = "登录失败"
            self.force_refresh()

    def build(self) -> rio.Component:
        return rio.Column(
            rio.Text("Matrix 登录", style=rio.TextStyle(font_weight="bold")),
            rio.TextInput(text=self.bind().server, label="服务器"),
            rio.TextInput(text=self.bind().username, label="用户名"),
            rio.TextInput(text=self.bind().password, label="密码", is_secret=True),
            rio.Button("登录", on_press=self.on_login),
            rio.Text(
                self.error,
                fill=rio.Color.from_hex("#b3261e"),
            )
            if self.error
            else rio.Spacer(),
            spacing=1,
            align_x=0.5,
            align_y=0.4,
        )
