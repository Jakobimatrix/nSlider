class NSlider {
    constructor(element, callback = null) {
        this.el = element;
        this.callback = callback;

        this.allowExpand = element.getAttribute("allow_expand") === "yes";

        this.min = parseFloat(element.getAttribute("min"));
        this.max = parseFloat(element.getAttribute("max"));
        this.originalMin = this.min;
        this.originalMax = this.max;
        this.step = parseFloat(element.getAttribute("stepsize"));
        this.crossing = element.getAttribute("handle_crossing") || "yes,nogap";

        this.handles = [];
        this.activeHandle = null;

        this.tooltip = document.createElement("div");
        this.tooltip.className = "tooltip";
        this.tooltip.style.display = "none";
        this.el.appendChild(this.tooltip);

        this.ticksContainer = document.createElement("div");
        this.ticksContainer.className = "ticks";
        this.el.appendChild(this.ticksContainer);


        this.createTicks(false);
        this.initHandles();
        this.attachEvents();
        this.updateAll();
    }

    setTooltipPosition(position, tooltipOffsetPixel = 25) {
        if (position === "top") {
            this.tooltip.style.top = `-${tooltipOffsetPixel}px`;
            unset(this.tooltip.style.left);
        }else if (position === "bottom") {
            this.tooltip.style.top = `${tooltipOffsetPixel}px`;
            unset(this.tooltip.style.left);
        }else if (position === "left") {
            this.tooltip.style.left = `-${tooltipOffsetPixel}px`;
            unset(this.tooltip.style.top);
        }else if (position === "right") {
            this.tooltip.style.left = `${tooltipOffsetPixel}px`;
            unset(this.tooltip.style.top);
        }
    }

    valueToPercent(v) {
        return (v - this.min) / (this.max - this.min) * 100;
    }

    percentToValue(p) {
        return this.min + p / 100 * (this.max - this.min);
    }

    clampStep(v) {
        return Math.round(v / this.step) * this.step;
    }

    parseCrossing() {
        const parts = this.crossing.split(",");
        return {
            allow: parts[0] === "yes",
            fix: parts.includes("fix"),
            gap: parts.includes("gap")
        };
    }

    initHandles() {
        const handleEls = this.el.querySelectorAll(".handle");
        handleEls.forEach((h, i) => {
            const value = parseFloat(h.getAttribute("value"));
            this.handles.push({ id: h.id || `h${i}`, el: h, value });
            this.attachHandleEvents(h);
        });
        this.sortHandles();
    }

    attachHandleEvents(el) {
        const start = e => {
            e.preventDefault();
            this.activeHandle = this.handles.find(h => h.el === el);
            this.tooltip.style.display = "block";
        };

        el.addEventListener("mousedown", start);
        el.addEventListener("touchstart", start, { passive: false });

        el.addEventListener("contextmenu", e => {
            e.preventDefault();
            this.removeHandle(el);
        });
    }

    attachEvents() {
        const move = e => {
            if (!this.activeHandle) return;

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const rect = this.el.getBoundingClientRect();
            let percent = (clientX - rect.left) / rect.width * 100;
            percent = Math.max(0, Math.min(100, percent));

            let value = this.percentToValue(percent);
            value = this.clampStep(value);
            value = Math.max(this.min, Math.min(this.max, value));

            this.applyCrossing(this.activeHandle, value);
            this.sortHandles();
            this.updateAll();
        };

        const end = () => {
            this.activeHandle = null;
            this.tooltip.style.display = "none";
        };

        document.addEventListener("mousemove", move);
        document.addEventListener("touchmove", move, { passive: false });
        document.addEventListener("mouseup", end);
        document.addEventListener("touchend", end);
    }

    applyCrossing(handle, newValue) {
        const index = this.handles.indexOf(handle);
        const left = this.handles[index - 1];
        const right = this.handles[index + 1];
        const c = this.parseCrossing();

        if (c.allow) {
            if (c.gap) {
                if (right && newValue >= right.value) newValue = right.value + this.step;
                if (left && newValue <= left.value) newValue = left.value - this.step;
            }
            handle.value = newValue;
            return;
        }

        if (right && newValue > right.value) {
            if (c.fix) newValue = c.gap ? right.value - this.step : right.value;
            else right.value = c.gap ? newValue + this.step : newValue;
        }

        if (left && newValue < left.value) {
            if (c.fix) newValue = c.gap ? left.value + this.step : left.value;
            else left.value = c.gap ? newValue - this.step : newValue;
        }

        handle.value = Math.max(this.min, Math.min(this.max, newValue));
    }

    updateAll(allowExpand = true) {
        this.handles.forEach(h => {
            const p = this.valueToPercent(h.value);
            h.el.style.left = p + "%";
        });

        if (this.activeHandle) {
            const p = this.valueToPercent(this.activeHandle.value);
            this.tooltip.style.left = p + "%";
            this.tooltip.innerText = this.activeHandle.value.toFixed(2);
        }

        if (this.callback) {
            this.callback(this.handles.map(h => ({
                id: h.id,
                value: h.value
            })));
        }

        if(allowExpand &&this.allowExpand && this.handles.length > 0) {
            // Handles are sorted
            const minHandle = this.handles[0];
            const maxHandle = this.handles[this.handles.length - 1];

            let changed = false;
            const tenPercent = (this.max - this.min) * 0.1;
            if (minHandle.value - tenPercent < this.min) {
                this.min = minHandle.value - tenPercent;
                changed = true;
            }else if(this.min < this.originalMin){
                this.min = Math.min(this.originalMin, minHandle.value - tenPercent);
                changed = true;
            }
            if (maxHandle.value + tenPercent > this.max) {
                this.max = maxHandle.value + tenPercent;
                changed = true;
            }else if(this.max > this.originalMax){
                this.max = Math.max(this.originalMax, maxHandle.value + tenPercent);
                changed = true;
            }

            if (changed) {
                this.updateAll(false);
                const createDyanmicTics = this.max - this.originalMax > tenPercent || this.originalMin - this.min > tenPercent;
                this.createTicks(createDyanmicTics);
            }
        }
    }

    setValue(id, value) {
        const handle = this.handles.find(h => h.id === id);
        if (handle) {
            this.applyCrossing(handle, value);
            this.sortHandles();
            this.updateAll();
        }
    }

    sortHandles() {
        this.handles.sort((a, b) => a.value - b.value);
    }

    createTicks(dynamic) {
        this.ticksContainer.innerHTML = "";

        const small = parseFloat(this.el.getAttribute("ticks-small"));
        const big   = parseFloat(this.el.getAttribute("ticks-big"));
        if (!small && !big) return;

        const range = this.max - this.min;

        const generate = (step, type, withLabel = false) => {
            if (!step) return;

            const count = Math.floor(range / step);

            for (let i = 0; i <= count; i++) {
                const value = this.min + i * step;
                const percent = this.valueToPercent(value);

                const tick = document.createElement("div");
                tick.className = `tick ${type}`;
                tick.style.left = percent + "%";
                this.ticksContainer.appendChild(tick);

                if (withLabel) {
                    const label = document.createElement("div");
                    label.className = "tick-label";
                    label.style.left = percent + "%";
                    label.innerText = this.formatSmart(value);
                    this.ticksContainer.appendChild(label);
                }
            }
        };

        if (dynamic) {
            const approxLabelCount = 10;
            const dynamicBig = range / approxLabelCount;
            const dynamicSmall = dynamicBig / 5;

            generate(dynamicSmall, "small", false);
            generate(dynamicBig, "big", true);
        } else {
            generate(small, "small", false);
            generate(big, "big", true);
        }
    }

    formatSmart(value) {
        if (!Number.isFinite(value)) return String(value);

        const abs = Math.abs(value);

        if (abs !== 0 && abs < 1e-4) {
            return this.formatScientific(value);
        }

        const rounded = Math.round(value * 1e4) / 1e4;

        let normal = rounded.toString();

        if (normal.includes(".")) {
            normal = normal.replace(/\.?0+$/, "");
        }

        const sci = this.formatScientific(value);

        return sci.length < normal.length ? sci : normal;
    }

    formatScientific(value) {
        const exp = value.toExponential(3); 
        return exp.replace(/\.?0+e/, "e");
    }

    addHandle(value, color = "#0d6efd", styleClass, deletable = false) {
        const el = document.createElement("div");
        el.className = "handle " + styleClass;
        el.style.setProperty("--handle-color", color);
        el.setAttribute("value", value);
        if (deletable) {
            el.setAttribute("deletable", "yes");
        }
        this.el.appendChild(el);

        const h = { id: "h" + Date.now(), el, value };
        this.handles.push(h);
        this.attachHandleEvents(el);
        this.applyCrossing(h, value);
        this.sortHandles();
        this.updateAll();
    }

    removeHandle(el) {
        if (el.getAttribute("deletable") === null || el.getAttribute("deletable") === "no") return;
        this.handles = this.handles.filter(h => h.el !== el);
        el.remove();
        this.updateAll();
    }
}
