# NiceGUI Matrix Chat

This project rewrites the former Vue based client using [NiceGUI](https://nicegui.io).
A small Python backend handles Matrix communication via [matrix-nio](https://github.com/poljar/matrix-nio)
and demonstrates NiceGUI's data binding features.

## Running

```bash
pip install -r requirements.txt
python -m nicegui_app.main
```

Edit the constants at the top of `nicegui_app/main.py` with your Matrix homeserver,
room id, username and password before running.

## Packaging

NiceGUI can produce native bundles for multiple platforms. Examples:

```bash
nicegui package nicegui_app/main.py --target windows
nicegui package nicegui_app/main.py --target macos
nicegui package nicegui_app/main.py --target android
```

The commands above create executables for Windows and macOS using PyInstaller and an APK for
Android via Buildozer.
