const name = "helloworld";
const commandName = "angle_between";
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
    const fontSize = 12;
    const [markerid, arcPrefix, textPrefix, groupPrefix] = [
      "angleBtwnArrowMarker",
      "arcdegree_",
      "angle_txt_",
      "angleGroup_"
    ];
    let startPoints = null;
    let endPoints = null;
    let currentId = null;

    /********************************************/
    function arc_links(x1, y1, x2, y2, k) {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const dx = (x2 - x1) / 2;
      const dy = (y2 - y1) / 2;
      const dd = Math.sqrt(dx * dx + dy * dy);
      let ex = cx + (dd ? dy / dd : 0) * k; //* (i - (n - 1) / 2);
      let ey = cy - (dd ? dx / dd : 0) * k; //* (i - (n - 1) / 2);
      const controlPoint = calculateControlPoint();

      if (controlPoint) {
        //https://codepen.io/branneman/pen/BfxjD?editors=1010
        [ex, ey] = [controlPoint.x, controlPoint.y];
      }

      return `M${x1} ${y1} Q${ex} ${ey} ${x2} ${y2}`;
    }

    function round(num, decimalPlaces) {
      num = Math.round(num + "e" + decimalPlaces);
      return Number(num + "e" + -decimalPlaces);
    }

    ///////////////////////////////////////////////////////////////////
    function createMarker() {
      let marker = $id(markerid);
      if (!marker) {
        marker = svgCanvas.createSVGElement({
          element: "marker",
          attr: {
            id: markerid,
            refY: 6,
            refX: 10,
            markerUnits: "strokeWidth",
            markerWidth: 13,
            markerHeight: 13,
            orient: "auto",
            style: "pointer-events:none"
          }
        });
        const arrow = svgCanvas.createSVGElement({
          element: "path",
          attr: {
            d: "M2,2 L2,11 L10,6 L2,2",
            fill: "red"
          }
        });
        marker.append(arrow);
        svgCanvas.findDefs().append(marker);
      }
      return marker;
    }
    /////////////////////////////////////////////////////////////

    function createDrawElement(id, svgPath, textPosition, text) {
      createMarker();
      const g = svgCanvas.createSVGElement({
        element: "g",
        attr: {
          id: groupPrefix + id
        }
      });

      const pathSVG = svgCanvas.createSVGElement({
        element: "path",
        attr: {
          id: arcPrefix + id,
          d: svgPath,
          fill: "none",
          stroke: "red",
          "stroke-width": "1",
          // "stroke-dasharray": "5,5",
          style: "pointer-events:none",
          "marker-end": `url(#${markerid})`
        }
      });

      const textSvg = svgCanvas.createSVGElement({
        element: "text",
        attr: {
          id: textPrefix + id,
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
      g.append(textSvg);
      g.append(pathSVG);

      return g;
    }

    ///////////////////////////////////////////////////////////////////
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
      angle = angle * (180 / Math.PI);
      if (angle < 0) {
        angle = 180 + angle;
      }

      return round(angle, 2) ?? 0;
    }

    function calculateControlPoint() {
      if (startPoints && endPoints.id) {
        const m1 =
          (startPoints.p1.x - startPoints.p2.x) /
          (startPoints.p2.y - startPoints.p1.y);
        const m2 =
          (endPoints.p1.x - endPoints.p2.x) / (endPoints.p2.y - endPoints.p1.y);
        const c1 = m1 * startPoints.p3.x - startPoints.p3.y;
        const c2 = m2 * endPoints.p3.x - endPoints.p3.y;
        const x = (c1 - c2) / (m1 - m2);
        const y = m1 * x - c1;

        console.log(x, y);
        const [a1, a2, b1, b2] = [
          endPoints.p3.x,
          startPoints.p3.x,
          endPoints.p3.y,
          startPoints.p3.y
        ];
        const div = a1 * b2 - a2 * b1;
        const x = (m1 * a1 * b2 - m2 * a2 * b1) / div;
        const y = (b1 * a2 - m1 * a1 * a2 - a1 * b2 + m2 * a1 * a2) / div;
        return { x, y };
      }

      return null;
    }

    ///////////////////////////////////////////////////////////////////

    function drawArc(id) {
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

        const svgGroup = createDrawElement(
          id,
          path,
          centerPoint,
          `${angleBetween}°`
        );

        currentCanvasLayer.prepend(svgGroup);
      }
    }

    function updateArc() {
      if (currentId && startPoints && endPoints) {
        const arcObject = $id(arcPrefix + currentId);
        const angleTextObject = $id(textPrefix + currentId);
        let angleBetween = 0;
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
          (centerPoint.x + centerPoint.y) / 12
        );

        if (startPoints.p1 && startPoints.p2 && endPoints.p1 && endPoints.p2) {
          angleBetween = calculateAngle(
            startPoints.p1,
            startPoints.p2,
            endPoints.p1,
            endPoints.p2
          );
        }

        arcObject.setAttribute("d", path);
        angleTextObject.innerHTML = `${angleBetween}°`;
        const textLength = angleTextObject.innerHTML.length;
        angleTextObject.setAttribute(
          "x",
          centerPoint.x + textLength * 2 + fontSize * 0.9
        );
        angleTextObject.setAttribute("y", centerPoint.y + 5);
      }
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback() {
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
      contextChanged() {
        currentCanvasLayer = svgCanvas.getCurrentDrawing().getCurrentLayer();
      },
      mouseDown(opts) {
        // Check the mode on mousedown
        if (svgCanvas.getMode() === commandName) {
          const e = opts.event;
          const { target } = e;
          if (["line", "path"].includes(target.nodeName)) {
            const elem = target;
            const p1 = { x: elem.x1.baseVal.value, y: elem.y1.baseVal.value };
            const p2 = { x: elem.x2.baseVal.value, y: elem.y2.baseVal.value };
            const p3 = { x: opts.start_x, y: opts.start_y };
            startPoints = { id: target.id, p1, p2, p3 };
            endPoints = { ...startPoints };
            currentId = svgCanvas.getNextId();
            drawArc(currentId);
            return { started: true };
          }
        }
        return undefined;
      },
      mouseMove(opts) {
        if (svgCanvas.getMode() === commandName) {
          const { target } = opts.event;
          const p3 = { x: opts.mouse_x, y: opts.mouse_y };
          let p1, p2, id;
          if (
            ["line", "path"].includes(target.nodeName) &&
            startPoints.id !== target.id
          ) {
            const elem = target;
            id = target.id;
            p1 = { x: elem.x1.baseVal.value, y: elem.y1.baseVal.value };
            p2 = { x: elem.x2.baseVal.value, y: elem.y2.baseVal.value };
          }
          endPoints = { id, p1, p2, p3 };
          updateArc();
        }
      },
      mouseUp(opts) {
        if (svgCanvas.getMode() === commandName) {
          if (currentId && !endPoints.id) {
            const groupObjAngleBetween = $id(groupPrefix + currentId);
            groupObjAngleBetween.remove();
          }
          startPoints = null;
          endPoints = null;
          currentId = null;
          return {
            keep: true
          };
        }

        return undefined;
      }
    };
  }
};
