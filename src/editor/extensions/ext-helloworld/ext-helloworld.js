const name = "helloworld";
import { getVisibleElements } from "./../../../svgcanvas/utilities";

const loadExtensionTranslation = async function(svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref("lang");
  try {
    translationModule = await import(`./locale/${lang}.js`);
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`);
    translationModule = await import("./locale/en.js");
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default);
};

export default {
  name,
  async init({ _importLocale }) {
    const svgEditor = this;
    await loadExtensionTranslation(svgEditor);
    const { svgCanvas } = svgEditor;
    const { $id, $click } = svgCanvas;
    let startPointSelected = null;
    let endPointSelected = null;

    /**
     * @description Check if pt3 is on line defined by pt1 and pt2.
     * https://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line
     */
    function pointOnLine(pt1, pt2, pt3) {
      const result = {
        between_x: false,
        between_y: false
      };

      // Check within x bounds
      if (
        (pt1.x <= pt3.x && pt3.x <= pt2.x) ||
        (pt2.x <= pt3.x && pt3.x <= pt1.x)
      ) {
        result.between_x = true;
      }

      // Check within y bounds
      if (
        (pt1.y <= pt3.y && pt3.y <= pt2.y) ||
        (pt2.y <= pt3.y && pt3.y <= pt1.y)
      ) {
        result.between_y = true;
      }

      return result.between_x && result.between_y;
    }

    function arc_links(x1, y1, x2, y2, k) {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const dx = (x2 - x1) / 2;
      const dy = (y2 - y1) / 2;
      const dd = Math.sqrt(dx * dx + dy * dy);
      const ex = cx + (dy / dd) * k; //* (i - (n - 1) / 2);
      const ey = cy - (dx / dd) * k; //* (i - (n - 1) / 2);
      return "M" + x1 + " " + y1 + " Q" + ex + " " + ey + " " + x2 + " " + y2;
    }

    function round(num, decimalPlaces) {
      num = Math.round(num + "e" + decimalPlaces);
      return Number(num + "e" + -decimalPlaces);
    }

    function calculateAngle(
      { x: Ax1, y: Ay1 },
      { x: Ax2, y: Ay2 },
      { x: Bx1, y: By1 },
      { x: Bx2, y: By2 }
    ) {
      const dAx = Ax2 - Ax1;
      const dAy = Ay2 - Ay1;
      const dBx = Bx2 - Bx1;
      const dBy = By2 - By1;
      let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
      if (angle < 0) {
        angle = angle * -1;
      }
      return round(angle * (180 / Math.PI), 2);
    }

    function drawArc(opts) {
      const parent = svgCanvas.getCurrentDrawing().getCurrentLayer();

      const elements = getVisibleElements(parent);

      Array.from(elements).every(elem => {
        if (elem.nodeName === "line") {
          const p1 = { x: elem.x1.baseVal.value, y: elem.y1.baseVal.value };
          const p2 = { x: elem.x2.baseVal.value, y: elem.y2.baseVal.value };
          const p3 = { x: opts.mouse_x, y: opts.mouse_y };
          if (elem && pointOnLine(p1, p2, p3)) {
            if (startPointSelected) {
              endPointSelected = { p1, p2, p3 };
            } else {
              startPointSelected = { p1, p2, p3 };
            }

            elem.setAttribute(
              "style",
              "stroke-linejoin: round; filter:  drop-shadow(1px 1px 0px purple) drop-shadow(-1px 1px 0px purple) drop-shadow(1px -1px 0px purple) drop-shadow(-1px -1px 0px purple);"
            );
            return false;
          }
        }
        return true;
      });

      // console.log(lastPointSelected, currentPointSelected);

      if (startPointSelected && endPointSelected) {
        const path = arc_links(
          startPointSelected.p3.x,
          startPointSelected.p3.y,
          endPointSelected.p3.x,
          endPointSelected.p3.y,
          30
        );

        const angleBetween = calculateAngle(
          startPointSelected.p1,
          startPointSelected.p2,
          endPointSelected.p1,
          endPointSelected.p2
        );
        const id = svgCanvas.getNextId();
        const pathSVG = svgCanvas.createSVGElement({
          element: "path",
          attr: {
            id: "arcdegree_" + id,
            d: path,
            fill: "none",
            stroke: "red",
            "stroke-width": "2",
            "stroke-dasharray": "5,5",
            // need to specify this so that the rect is not selectable
            style: "pointer-events:none"
          }
        });
        const fontSize = 12;
        const [cx, cy] = [
          (startPointSelected.p3.x + endPointSelected.p3.x) / 2,
          (startPointSelected.p3.y + endPointSelected.p3.y) / 2
        ];
        const text = svgCanvas.createSVGElement({
          element: "text",
          attr: {
            id: "txt_" + id,
            fill: "black",
            stroke: "none",
            "stroke-width": 0,
            x: cx + 3,
            y: cy - 3 + (fontSize + 6),
            //  "font-family": font,
            "font-size": fontSize,
            "text-anchor": "start"
          }
        });
        text.innerHTML = `${angleBetween}°`;
        parent.append(pathSVG);
        parent.append(text);
        startPointSelected = null;
        endPointSelected = null;
      }
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback() {
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement("template");
        const title = `${name}:buttons.0.title`;
        buttonTemplate.innerHTML = `
        <se-button id="hello_world" title="${title}" src="hello_world.svg"></se-button>
        `;
        $id("tools_left").append(buttonTemplate.content.cloneNode(true));
        $click($id("hello_world"), () => {
          svgCanvas.setMode("hello_world");
        });
      },

      mouseDown() {
        // Check the mode on mousedown
        if (svgCanvas.getMode() === "hello_world") {
          // The returned object must include "started" with
          // a value of true in order for mouseUp to be triggered
          return { started: true };
        }
        return undefined;
      },
      mouseMove(opts) {},
      mouseUp(opts) {
        // Check the mode on mouseup
        let started = !(startPointSelected || endPointSelected);
        if (svgCanvas.getMode() === "hello_world") {
          drawArc(opts);
          //alert(text)

          return {
            keep: true,
            started
          };
        }
      }
    };
  }
};
