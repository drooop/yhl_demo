from __future__ import annotations

import asyncio
import rio

from ..services.matrix_service import MatrixService
from ..components.chat_panel import ChatPanel


@rio.page(name="Home", url_segment="")
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
                    margin=1,
                ),
                rio.Row(
                    rio.Column(
                        rio.Text("Sidebar"),
                        grow_y=True,
                        min_width=20,
                        # fill=rio.Color.from_hex("#F0F0F0"),
                    ),
                    rio.Column(
                        rio.Rectangle(
                            fill=rio.Color.from_hex("#DCDCDC"),
                            grow_y=True,
                            min_height=20
                        ),
                        grow_y=True,
                    ),
                    proportions=[1, 4],
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
                on_open_or_close=lambda e: setattr(
                    self, "chat_open", e.is_open),
            ),
        )

        if self.show_call:
            dialog = rio.DialogContainer(
                build_content=lambda: rio.Column(
                    rio.Text("视频通话"),
                    rio.Webview("https://meet.jit.si",
                                min_height=25, min_width=40),
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
