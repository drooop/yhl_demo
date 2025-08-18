from __future__ import annotations

import asyncio
from typing import List

from nicegui import app, ui

from .matrix_backend import MatrixClient

# basic configuration
HOMESERVER = "https://matrix-client.matrix.org"
ROOM_ID = "!roomid:matrix.org"  # replace with your room
USERNAME = "@user:matrix.org"
PASSWORD = "password"

matrix = MatrixClient(HOMESERVER, USERNAME, PASSWORD)
messages: List[str] = []


@ui.refreshable
def chat() -> None:
    with ui.column().classes("w-full"):
        for entry in messages:
            ui.chat_message(entry)


def handle_message(room: str, event) -> None:
    messages.append(f"{event.sender}: {event.body}")
    chat.refresh()


async def send() -> None:
    text = input_box.value
    if text:
        await matrix.send_message(ROOM_ID, text)
        input_box.value = ""


async def startup() -> None:
    await matrix.login()
    matrix.add_message_listener(handle_message)
    asyncio.create_task(matrix.sync_forever())


app.on_startup(startup)

chat()
with ui.row().classes("w-full"):
    input_box = ui.input(placeholder="Type a message...", on_change=None)
    ui.button("Send", on_click=lambda: asyncio.create_task(send()))

ui.run()
