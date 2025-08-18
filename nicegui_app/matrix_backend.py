from __future__ import annotations

import asyncio
from typing import Awaitable, Callable, List

from nio import AsyncClient, LoginResponse, RoomMessageText


class MatrixClient:
    """Asynchronous Matrix client for NiceGUI UI."""

    def __init__(self, homeserver: str, user: str, password: str) -> None:
        self._client = AsyncClient(homeserver, user)
        self._password = password
        self._listeners: List[Callable[[str, RoomMessageText], Awaitable[None]]] = []

    async def login(self) -> LoginResponse:
        return await self._client.login(self._password)

    def add_message_listener(
        self, callback: Callable[[str, RoomMessageText], Awaitable[None]]
    ) -> None:
        self._listeners.append(callback)
        self._client.add_event_callback(callback, RoomMessageText)

    async def send_message(self, room_id: str, message: str) -> None:
        await self._client.room_send(
            room_id,
            message_type="m.room.message",
            content={"msgtype": "m.text", "body": message},
        )

    async def sync_forever(self) -> None:
        await self._client.sync_forever(timeout=30000)

    async def close(self) -> None:
        await self._client.close()
