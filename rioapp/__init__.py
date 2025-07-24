from __future__ import annotations

from pathlib import Path
import rio

from .pages.main_page import MainPage
from .pages.login_page import LoginPage

# Define a simple theme similar to the riotest example
app = rio.App(
    name="yhl_rio_app",
    theme=rio.Theme.from_colors(
        primary_color=rio.Color.from_hex("01dffdff"),
        secondary_color=rio.Color.from_hex("0083ffff"),
    ),
    assets_dir=Path(__file__).parent / "assets",
    pages=[
        rio.ComponentPage(name="Home", url_segment="", build=MainPage),
        rio.ComponentPage(name="登录", url_segment="login", build=LoginPage),
    ],
)
