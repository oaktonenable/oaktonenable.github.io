# IsoWrite CAD model

The model preview automatically loads `isowrite.glb` from this folder. Keep
that filename so the viewer can find it.

To update the displayed assembly, replace this file with the new single-file
binary glTF (`.glb`) export and keep the same filename. Other formats, including
`.step`, `.stp`, and `.stl`, are not supported; export those models to `.glb`
first.

For local development, you can open `isowrite-model.html` directly or serve the
site from the project folder with `python -m http.server`.
