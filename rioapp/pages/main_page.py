from __future__ import annotations

import asyncio
import json
from functools import partial
from pathlib import Path
from dataclasses import field
import rio

from ..services.matrix_service import MatrixService
from ..components.chat_panel import ChatPanel


@rio.page(name="Home", url_segment="")
class MainPage(rio.Component):
    chat_open: bool = False
    show_call: bool = False
    menu_open: bool = False
    settings_open: bool = False
    selected_path: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        tree_file = Path(__file__).resolve().parent.parent.parent / "public" / "tree.json"
        with open(tree_file, "r", encoding="utf-8") as f:
            self.tree_data = json.load(f)

    def on_toggle_chat(self) -> None:
        self.chat_open = not self.chat_open
        self.force_refresh()

    def on_toggle_call(self) -> None:
        self.show_call = not self.show_call
        self.force_refresh()

    def on_toggle_menu(self) -> None:
        self.menu_open = not self.menu_open
        self.force_refresh()

    def on_close_menu(self) -> None:
        self.menu_open = False
        self.force_refresh()

    def on_open_settings(self) -> None:
        self.menu_open = False
        self.settings_open = True
        self.force_refresh()

    def on_close_settings(self) -> None:
        self.settings_open = False
        self.force_refresh()

    def on_logout(self) -> None:
        self.session.navigate_to("/login")
        self.menu_open = False
        self.force_refresh()

    def on_select(self, path: list[str]) -> None:
        self.selected_path = path
        self.force_refresh()

    def build_tree(self, nodes, depth=0, path=None) -> list[rio.Component]:
        if path is None:
            path = []
        comps = []
        for node in nodes:
            node_path = path + [node.get("label", "")] 
            comps.append(
                rio.Button(
                    node.get("label", ""),
                    on_press=partial(self.on_select, node_path),
                    margin_left=depth,
                )
            )
            children = node.get("children")
            if children:
                comps.extend(self.build_tree(children, depth + 1, node_path))
        return comps

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
                    rio.Button("用户", on_press=self.on_toggle_menu),
                    spacing=1,
                    margin=1,
                ),
                rio.Row(
                    rio.Column(
                        *self.build_tree(self.tree_data),
                        grow_y=True,
                        min_width=20,
                    ),
                    rio.Column(
                        rio.Column(
                            rio.Text(
                                "云海流 - " + " - ".join(self.selected_path)
                                if self.selected_path else "请选择节点",
                                fill="black",
                            ),
                            align_x=0.5,
                            align_y=0.5,
                            grow_y=True,
                            grow_x=True,
                        ),
                        fill=rio.Color.from_hex("#FFFFFF"),
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

        if self.menu_open:
            menu = rio.DialogContainer(
                build_content=lambda: rio.Column(
                    rio.Button("设置", on_press=self.on_open_settings),
                    rio.Button("登出", on_press=self.on_logout),
                    spacing=1,
                ),
                owning_component_id=self.id,
                is_modal=False,
                is_user_closable=True,
                on_close=self.on_close_menu,
            )
            layout = rio.Stack(layout, menu)

        if self.settings_open:
            dialog = rio.DialogContainer(
                build_content=lambda: rio.Column(
                    rio.Text("示例设置界面"),
                    rio.Button("关闭", on_press=self.on_close_settings),
                    spacing=1,
                    align_x=0.5,
                    align_y=0.5,
                ),
                owning_component_id=self.id,
                is_modal=True,
                is_user_closable=True,
                on_close=self.on_close_settings,
            )
            layout = rio.Stack(layout, dialog)

        return layout
