from __future__ import annotations

import asyncio
import rio

from ..services.matrix_service import MatrixService


class ChatPanel(rio.Component):
    msg: str = ""

    def __post_init__(self) -> None:
        try:
            self.service = self.session[MatrixService]
        except KeyError:
            self.service = None
        if self.service:
            self.session.create_task(self.refresh_loop(), name="chat-refresh")

    async def refresh_loop(self) -> None:
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
            rio.Column(
                *(rio.Text(m) for m in messages),
                grow_y=True,
            ),
            rio.Row(
                rio.TextInput(text=self.bind().msg, grow_x=True,
                              on_confirm=self.on_send),
                rio.Button("发送", on_press=self.on_send),
                spacing=1,
            ),
            spacing=1,
            grow_y=True,
            min_width=20,
        )
