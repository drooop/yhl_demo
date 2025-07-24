from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import List, Tuple

from nio import AsyncClient, LoginResponse, RoomMessageText

# Default credentials and recovery phrase from the original project
HOMESERVER = "https://synapse.m2m.yhlcps.com"
USERNAME = "@drop:m2m.yhlcps.com"
PASSWORD = "TQcps@123_"
RECOVERY_PHRASE = (
    "EsTZ dyEr fz4E rCYt 8Frv 64Vo DEeb somw Yvnu ty3v 76Ju QXgL"
)

@dataclass
class MatrixService:
    homeserver: str = HOMESERVER
    user: str = USERNAME
    password: str = PASSWORD

    client: AsyncClient | None = field(init=False, default=None)
    room_id: str | None = field(init=False, default=None)
    messages: List[Tuple[str, str]] = field(init=False, default_factory=list)
    _sync_task: asyncio.Task | None = field(init=False, default=None)

    async def login(self) -> bool:
        self.client = AsyncClient(self.homeserver, self.user)
        resp = await self.client.login(self.password)
        if isinstance(resp, LoginResponse):
            await self.client.sync(timeout=3000)
            if not self.client.rooms:
                return False
            self.room_id = next(iter(self.client.rooms))
            self._sync_task = asyncio.create_task(self._sync_loop())
            return True
        return False

    async def _sync_loop(self) -> None:
        assert self.client
        while True:
            await self.client.sync(timeout=3000)
            if self.room_id:
                room = self.client.rooms.get(self.room_id)
                if room:
                    for ev in room.timeline:
                        if isinstance(ev, RoomMessageText):
                            self.messages.append((ev.sender, ev.body))
                            self.messages = self.messages[-50:]
            await asyncio.sleep(1)

    async def send_message(self, msg: str) -> None:
        if self.client and self.room_id:
            await self.client.room_send(
                room_id=self.room_id,
                message_type="m.room.message",
                content={"msgtype": "m.text", "body": msg},
            )
