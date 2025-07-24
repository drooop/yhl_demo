import asyncio
from nio import AsyncClient, LoginResponse, RoomMessageText

class MatrixService:
    def __init__(self, homeserver: str):
        self.client = AsyncClient(homeserver)
        self.room_id = None
        self.messages: list[tuple[str, str]] = []
        self._sync_task: asyncio.Task | None = None

    async def login(self, username: str, password: str) -> bool:
        resp = await self.client.login(username, password)
        if isinstance(resp, LoginResponse):
            await self.client.sync(timeout=3000)
            if not self.client.rooms:
                return False
            self.room_id = next(iter(self.client.rooms))
            self._sync_task = asyncio.create_task(self._sync_loop())
            return True
        return False

    async def _sync_loop(self):
        while True:
            await self.client.sync(timeout=3000)
            room = self.client.rooms.get(self.room_id)
            if room:
                for ev in room.timeline:
                    if isinstance(ev, RoomMessageText):
                        self.messages.append((ev.sender, ev.body))
                        self.messages = self.messages[-50:]
            await asyncio.sleep(1)

    async def send_message(self, msg: str):
        if self.client and self.room_id:
            await self.client.room_send(
                room_id=self.room_id,
                message_type="m.room.message",
                content={"msgtype": "m.text", "body": msg},
            )
