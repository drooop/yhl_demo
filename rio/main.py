import asyncio
import rio
from matrix_service import MatrixService

# Login Component
class LoginPage(rio.Component):
    server: str = "https://matrix.org"
    username: str = ""
    password: str = ""
    error: str = ""

    async def on_login(self) -> None:
        service = MatrixService(self.server)
        ok = await service.login(self.username, self.password)
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
            rio.Text(self.error, fill="danger") if self.error else rio.Spacer(),
            spacing=1,
            align_x=0.5,
            align_y=0.4,
        )

# Chat Component
class ChatPanel(rio.Component):
    msg: str = ""

    def __post_init__(self) -> None:
        try:
            self.service = self.session[MatrixService]
        except KeyError:
            self.service = None
        if self.service:
            # schedule refresh loop
            self.session.create_task(self.refresh_loop(), name="chat-refresh")

    async def refresh_loop(self):
        while True:
            self.force_refresh()
            await asyncio.sleep(1)

    async def on_send(self) -> None:
        if self.service:
            await self.service.send_message(self.msg)
            self.msg = ""
            self.force_refresh()

    def build(self) -> rio.Component:
        messages = []
        if self.service:
            messages = [f"{u}: {m}" for u, m in self.service.messages]
        return rio.Column(
            rio.Column(*(rio.Text(m) for m in messages), grow_y=True, scroll_y="auto"),
            rio.Row(
                rio.TextInput(text=self.bind().msg, grow_x=True, on_confirm=self.on_send),
                rio.Button("发送", on_press=self.on_send),
                spacing=1,
            ),
            spacing=1,
            grow_y=True,
            min_width=20,
        )

# Main Layout
class MainPage(rio.Component):
    chat_open: bool = False
    show_call: bool = False

    def on_toggle_chat(self) -> None:
        self.chat_open = not self.chat_open

    def on_toggle_call(self) -> None:
        self.show_call = not self.show_call

    def build(self) -> rio.Component:
        try:
            self.session[MatrixService]
        except KeyError:
            self.session.navigate_to("/login")
            return rio.Text("重定向中")

        layout = rio.Stack(
            rio.Column(
                rio.Row(
                    rio.Text("yhl", style=rio.TextStyle(font_weight="bold")),
                    rio.Spacer(),
                    rio.Button("聊天", on_press=self.on_toggle_chat),
                    rio.Button("视频", on_press=self.on_toggle_call),
                    spacing=1,
                    padding=1,
                ),
                rio.Row(
                    rio.Column(
                        rio.Text("Sidebar"),
                        grow_y=True,
                        min_width=20,
                        fill=rio.rgb(240,240,240),
                    ),
                    rio.Column(
                        rio.Rectangle(fill=rio.rgb(220,220,220), grow_y=True, min_height=20),
                        grow_y=True,
                    ),
                    proportions=[1,4],
                    grow_y=True,
                ),
                grow_y=True,
            ),
            rio.Drawer(
                anchor=rio.Rectangle(min_width=0),
                content=ChatPanel(),
                side="right",
                is_open=self.chat_open,
                is_modal=False,
                on_open_or_close=lambda e: setattr(self, "chat_open", e.is_open),
            ),
        )

        if self.show_call:
            dialog = rio.DialogContainer(
                build_content=lambda: rio.Column(
                    rio.Text("视频通话"),
                    rio.Webview("https://meet.jit.si", min_height=25, min_width=40),
                    rio.Button("关闭", on_press=self.on_toggle_call),
                    spacing=1,
                ),
                owning_component_id=self.id,
                is_modal=True,
                is_user_closable=True,
                on_close=lambda: setattr(self, "show_call", False),
            )
            return rio.Stack(layout, dialog)

        return layout

app = rio.App(
    name="yhl_rio",
    pages=[
        rio.ComponentPage(name="Home", url_segment="", build=MainPage),
        rio.ComponentPage(name="登录", url_segment="login", build=LoginPage),
    ],
)

if __name__ == "__main__":
    app.run_in_browser()
