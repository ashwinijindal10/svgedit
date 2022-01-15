const name = "helloworld";
const commandName = "hello_world";
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
    let currentCanvasLayer = svgCanvas.getCurrentDrawing().getCurrentLayer();
    let startPoints = null;
    let endPoints = null;

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

    function createDrawElement(id, svgPath, textPosition, text) {
      const fontSize = 15;
      const g = svgCanvas.createSVGElement({
        element: "g",
        attr: {
          id: "angleGroup_" + id
        }
      });

      const pathSVG = svgCanvas.createSVGElement({
        element: "path",
        attr: {
          id: "arcdegree_" + id,
          d: svgPath,
          fill: "none",
          stroke: "red",
          "stroke-width": "1",
          // "stroke-dasharray": "5,5",
          style: "pointer-events:none"
        }
      });

      const textSvg = svgCanvas.createSVGElement({
        element: "text",
        attr: {
          id: "angle_txt_" + id,
          fill: "black",
          stroke: "none",
          "stroke-width": 0,
          x: textPosition.x + fontSize * 0.8,
          y: textPosition.y - 3,
          "font-size": fontSize,
          "text-anchor": "start"
        }
      });
      textSvg.innerHTML = text;

      g.append(pathSVG);
      g.append(textSvg);

      return g;
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
      return round(angle * (180 / Math.PI), 2) ?? 0;
    }

    function drawArc(opts) {
      const elements = getVisibleElements(currentCanvasLayer);

      Array.from(elements).every(elem => {
        if (elem.nodeName === "line") {
          const p1 = { x: elem.x1.baseVal.value, y: elem.y1.baseVal.value };
          const p2 = { x: elem.x2.baseVal.value, y: elem.y2.baseVal.value };
          const p3 = { x: opts.mouse_x, y: opts.mouse_y };
          if (elem && pointOnLine(p1, p2, p3)) {
            if (startPoints) {
              endPoints = { p1, p2, p3 };
            } else {
              startPoints = { p1, p2, p3 };
            }

            elem.setAttribute("class", "angle-selected");
            return false;
          }
        }
        return true;
      });

      if (startPoints && endPoints) {
        const centerPoint = {
          x: (startPoints.p3.x + endPoints.p3.x) / 2,
          y: (startPoints.p3.y + endPoints.p3.y) / 2
        };
        const offset = 2;
        const path = arc_links(
          startPoints.p3.x + offset,
          startPoints.p3.y + offset,
          endPoints.p3.x + offset,
          endPoints.p3.y + offset,
          (centerPoint.x + centerPoint.y) / 10
        );

        const angleBetween = calculateAngle(
          startPoints.p1,
          startPoints.p2,
          endPoints.p1,
          endPoints.p2
        );
        const id = svgCanvas.getNextId();

        const svgGroup = createDrawElement(
          id,
          path,
          centerPoint,
          `${angleBetween}°`
        );

        currentCanvasLayer.prepend(svgGroup);

        startPoints = null;
        endPoints = null;
      }
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback() {
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement("template");
        const title = `${name}:buttons.0.title`;
        buttonTemplate.innerHTML = `
        <se-button id="${commandName}" title="${title}" src="${commandName}.svg"></se-button>
        `;
        $id("tools_left").append(buttonTemplate.content.cloneNode(true));
        $click($id(commandName), () => {
          svgCanvas.setMode(commandName);
          currentCanvasLayer.classList.add("angleBetweenActive");
        });
        $click($id("tools_left"), () => {
          if (svgCanvas.getMode() !== commandName) {
            currentCanvasLayer.classList.remove("angleBetweenActive");
          }
        });
      },
      contextChanged(win, context) {
        currentCanvasLayer = svgCanvas.getCurrentDrawing().getCurrentLayer();
      },
      mouseDown() {
        // Check the mode on mousedown
        if (svgCanvas.getMode() === commandName) {
          return { started: true };
        }
        return undefined;
      },
      mouseMove(opts) {
        if (svgCanvas.getMode() === commandName) {
        }
        // currentCanvasLayer.classList.remove("angleBetweenActive");
      },
      mouseUp(opts) {
        // Check the mode on mouseup
        let started = !(startPoints || endPoints);
        if (svgCanvas.getMode() === commandName) {
          drawArc(opts);

          return {
            keep: true,
            started
          };
        }

        return undefined;
      }
    };
  }
};
