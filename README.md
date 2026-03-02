# NSlider

nSlider is a lightweight, dependency-free, multi-handle slider written in plain JavaScript.  
It supports dynamic ranges, smart ticks, customizable handles, and strict or flexible handle crossing rules.

Bootstrap is not required. It is only used in the example files for visual presentation.

---

## Features

- Multiple handles per slider
- Configurable handle crossing behavior
- Optional minimum gap between handles
- Handle pushing or fixed blocking
- Dynamic range expansion
- Smart tick generation (static or dynamic)
- Tooltip showing active handle value
- Add and remove handles at runtime
- Custom handle styles via CSS classes
- Full mouse and touch support
- Callback with sorted handle values on change

---

## Live Demo

[<img src="https://gist.github.com/cxmeel/0dbc95191f239b631c3874f4ccf114e2/raw/play.svg" alt="click me" height="32" />](https://jakobimatrix.github.io/nSlider/index.html)

## Basic Usage

### 1. Include Files
Copy:
- `js/nSlider.js`
- `css/nSlider.css`

```html
<link rel="stylesheet" href="css/nSlider.css">
<script src="js/nSlider.js"></script>

...
<div class="n-slider"
     id="mySlider"
     min="0"
     max="100"
     stepsize="1"
     handle_crossing="no,fix,gap"
     ticks-big="10"
     ticks-small="2">

    <div class="handle handleCircle" id="h1" value="25"></div>
    <div class="handle handleCircle" id="h2" value="75"></div>
</div>

...
<script>
const slider = new NSlider(
    document.getElementById("mySlider"),
    values => {
        console.log(values);
    }
);
</script>
...
```
The callback receives:

```javascript
[
  { id: "h1", value: 25 },
  { id: "h2", value: 75 }
]
```
Handles are always sorted by value.

| Attribute         | Description                    |
| ----------------- | ------------------------------ |
| `min`             | Minimum slider value           |
| `max`             | Maximum slider value           |
| `stepsize`        | Step resolution                |
| `handle_crossing` | Crossing behavior              |
| `ticks-small`     | Small tick spacing             |
| `ticks-big`       | Big tick spacing (with labels) |
| `allow_expand`    | Enables dynamic range growth   |

## Handle Crossing Modes

`handle_crossing="allow,mode1,mode2"`

- allow: `yes` / `no` → allow crossing
- mode1: `fix` / `` → block at boundary
- mode2: `gap` / `nogap` → enforce minimum step gap / allow touching

### Examples

- `no,fix,gap` → cannot cross or touch
- `no,nogap` → cannot cross but can push
- `yes,gap` → can cross but not share valu
- `yes,nogap` → fully free movement

## Public Methods

### Set Handle Value

```javascript
slider.setValue("h1", 40);
```

### Add Handle

```javascript
value = 10;;
color = "#ff0000";
cssStyleClass = "handleCircle";
deletable = true;
slider.addHandle(value, color, cssStyleClass, deletable);
```

### Remove Handle

Right-click a deletable handle
or call

```javascript
slider.removeHandle(element);
```

### Tooltip Position

Options: top, bottom, left, right

```javascript
slider.setTooltipPosition("top");
```

### Dynamic Expansion

If `allow_expand="yes"` is set:
Slider range grows when handles approach boundaries
Ticks switch to dynamic spacing automatically

## Handle Styles Included

- `handleCircle`
- `handle3DBall`
- `handle3DDial`
- `handleTriangleUp`
- `handleTriangleDown`
- `handleThinBar`
- `handleThickBar`

Or make your own custom css class