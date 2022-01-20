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
    const [
      textFilterId,
      markerid,
      arcPrefix,
      textPrefix,
      textPrefixRef,
      groupPrefix
    ] = [
      "textfilterAngleBetween",
      "angleBtwnArrowMarker",
      "arcdegree_",
      "angle_txt_",
      "angle_txt_ref_",
      "angleGroup_"
    ];
    let startPoints = null;
    let endPoints = null;
    let currentId = null;

    /******************** common ************************/

    function round(num, decimalPlaces) {
      num = Math.round(num + "e" + decimalPlaces);
      return Number(num + "e" + -decimalPlaces);
    }

    ////////////////////////////// calculation //////////////////////////////////////////////////

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
      if (startPoints && endPoints.p3) {
        const m1 =
          (startPoints.p1.x - startPoints.p2.x) /
          (startPoints.p2.y - startPoints.p1.y);
        let m2;

        if (endPoints.id && startPoints.id !== endPoints.id) {
          m2 =
            (endPoints.p1.x - endPoints.p2.x) /
            (endPoints.p2.y - endPoints.p1.y);
        } else {
          m2 = -1 / m1;
        }

        const c1 = m1 * startPoints.p3.x - startPoints.p3.y;
        const c2 = m2 * endPoints.p3.x - endPoints.p3.y;
        const x = (c1 - c2) / (m1 - m2);
        const y = m1 * x - c1;

        return { x: Math.abs(x) ?? 0, y: Math.abs(y) ?? 0 };
      }

      return null;
    }

    //////////////////////////////// drawing obj///////////////////////////////////
    function createTextFilter() {
      let filter = $id(textFilterId);
      if (!filter) {
        filter = svgCanvas.createSVGElement({
          element: "filter",
          attr: {
            id: textFilterId,
            x: 0,
            y: 0,
            width: 1,
            height: 1
          }
        });
        const feFlood = svgCanvas.createSVGElement({
          element: "feFlood",
          attr: {
            "flood-color": "#cccc"
          }
        });

        const feComposite = svgCanvas.createSVGElement({
          element: "feComposite",
          attr: {
            in: "SourceGraphic",
            operator: "xor"
          }
        });
        filter.append(feFlood);
        filter.append(feComposite);
      }
      svgCanvas.findDefs().append(filter);
      return filter;
    }

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

    function createAngleArc(id, x1, y1, x2, y2, cx, cy) {
      const path = `M${x1} ${y1} Q${cx ?? 0} ${cy ?? 0} ${x2} ${y2}`;
      const arcid = arcPrefix + id;
      let arcObject = $id(arcid);
      if (!arcObject) {
        arcObject = svgCanvas.createSVGElement({
          element: "path",
          attr: {
            id: arcid,
            fill: "none",
            stroke: "red",
            "stroke-width": "1",
            style: "pointer-events:none",
            "marker-end": `url(#${markerid})`
          }
        });
      }

      arcObject.setAttribute("d", path);
      return arcObject;
    }

    function createTextLabel(id, text, x, y) {
      const txtid = textPrefix + id;
      let textObject = $id(txtid);
      if (!textObject) {
        textObject = svgCanvas.createSVGElement({
          element: "text",
          attr: {
            id: textPrefix + id,
            fill: "black",
            stroke: "none",
            "stroke-width": 0,
            x,
            y,
            "font-size": fontSize,
            "text-anchor": "start"
          }
        });
      }
      textObject.innerHTML = text;
      textObject.setAttribute("x", x);
      textObject.setAttribute("y", y);
      return textObject;
    }

    function createTextRef(id) {
      const txtrefid = textPrefixRef + id;
      let textRefObject = $id(txtrefid);
      if (!textRefObject) {
        textRefObject = svgCanvas.createSVGElement({
          element: "use",
          attr: {
            id: txtrefid,
            "xlink:href": `#${textPrefix + id}`,
            filter: `url(#${textFilterId})`
          }
        });
      }
      return textRefObject;
    }

    function createAngleGroup(id) {
      const grid = groupPrefix + id;
      let isNew = false;
      let grObject = $id(grid);

      if (!grObject) {
        isNew = true;
        grObject = svgCanvas.createSVGElement({
          element: "g",
          attr: {
            id: grid
          }
        });
      }

      return { grObject, isNew };
    }

    /////////////////////////////////////////////////////////////

    function drawAnnotation(id) {
      createTextFilter();
      createMarker();
      const angleGroupStatus = createAngleGroup(id);
      const groupObj = angleGroupStatus.grObject;
      let ctrlPoint = calculateControlPoint();
      const angleBetween =
        startPoints.p1 && startPoints.p2 && endPoints.p1 && endPoints.p2
          ? calculateAngle(
              startPoints.p1,
              startPoints.p2,
              endPoints.p1,
              endPoints.p2
            )
          : 0;

      const [center_x, center_y] = [
        (startPoints.p3.x + endPoints.p3.x) / 2,
        (startPoints.p3.y + endPoints.p3.y) / 2
      ];

      const [final_cx, final_cy] = [
        (center_x + ctrlPoint.x) * 0.5,
        (center_y + ctrlPoint.y) * 0.5
      ];

      const angleArcObject = createAngleArc(
        id,
        startPoints.p3.x,
        startPoints.p3.y,
        endPoints.p3.x,
        endPoints.p3.y,
        final_cx,
        final_cy
      );

      const textSvg = createTextLabel(
        id,
        `${angleBetween}°`,
        final_cx,
        final_cy
      );

      if (angleGroupStatus.isNew) {
        groupObj.append(createTextRef(id));
        groupObj.append(textSvg);
        groupObj.append(angleArcObject);
        currentCanvasLayer.prepend(groupObj);
      }
      return groupObj;
    }

    ///////////////////////////////////////////////////////////////////

    class SVGPathSegType {
      static PATHSEG_UNKNOWN = 0;
      static PATHSEG_MOVETO_ABS = 2;
      static PATHSEG_CLOSEPATH = 1;
      static PATHSEG_MOVETO_REL = 3;
      static PATHSEG_LINETO_ABS = 4;
      static PATHSEG_LINETO_REL = 5;
      static PATHSEG_CURVETO_CUBIC_ABS = 6;
      static PATHSEG_CURVETO_CUBIC_REL = 7;
      static PATHSEG_CURVETO_QUADRATIC_ABS = 8;
      static PATHSEG_CURVETO_QUADRATIC_REL = 9;
      static PATHSEG_ARC_ABS = 10;
      static PATHSEG_ARC_REL = 11;
      static PATHSEG_LINETO_HORIZONTAL_ABS = 12;
      static PATHSEG_LINETO_HORIZONTAL_REL = 13;
      static PATHSEG_LINETO_VERTICAL_ABS = 14;
      static PATHSEG_LINETO_VERTICAL_REL = 15;
      static PATHSEG_CURVETO_CUBIC_SMOOTH_ABS = 16;
      static PATHSEG_CURVETO_CUBIC_SMOOTH_REL = 17;
      static PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS = 18;
      static PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL = 19;
    }

    function convertPathToPolyline(pathSegList) {
      let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      let convertedLinesArray = new Array();
      let lastPoint = svg.createSVGPoint();
      let nextpoint;

      for (let i = 0; i < pathSegList.length; i++) {
        let pathSeg = pathSegList.getItem(i);
        let pathSegType = pathSeg.pathSegType;
        let pathSegX = pathSeg.x;
        let pathSegY = pathSeg.y;
        switch (pathSegType) {
          case SVGPathSeg.PATHSEG_MOVETO_ABS:
            lastPoint.x = pathSegX;
            lastPoint.y = pathSegY;
            break;

          case SVGPathSeg.PATHSEG_MOVETO_REL:
            lastPoint.x += pathSegX;
            lastPoint.y += pathSegY;
            break;

          case SVGPathSeg.PATHSEG_LINETO_ABS:
            nextpoint = svg.createSVGPoint();
            nextpoint.x = pathSegX;
            nextpoint.y = pathSegY;
            convertedLinesArray.push(lastPoint, nextpoint);
            lastPoint = nextpoint;
            break;

          case SVGPathSeg.PATHSEG_LINETO_REL:
            nextpoint = svg.createSVGPoint();
            nextpoint.x = lastPoint.x + pathSegX;
            nextpoint.y = lastPoint.y + pathSegY;
            convertedLinesArray.push(lastPoint, nextpoint);
            lastPoint = nextpoint;
            break;

          case SVGPathSeg.PATHSEG_CLOSEPATH:
            break;
        }
      }

      return convertedLinesArray;
    }

    ///////////////////////////////////////////////////////////////
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

            if (target.nodeName == "path") {
              console.log(target.pathSegList);
              const lines = convertPathToPolyline(target.pathSegList);
              console.log(lines);
            }

            const p1 = { x: elem.x1.baseVal.value, y: elem.y1.baseVal.value };
            const p2 = { x: elem.x2.baseVal.value, y: elem.y2.baseVal.value };
            const p3 = { x: opts.start_x, y: opts.start_y };
            startPoints = { id: target.id, p1, p2, p3 };
            endPoints = { ...startPoints };
            currentId = svgCanvas.getNextId();
            drawAnnotation(currentId);
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
          drawAnnotation(currentId);
        }
      },
      mouseUp(opts) {
        if (svgCanvas.getMode() === commandName) {
          if (currentId && !endPoints.id) {
            const groupObjAngleBetween = $id(groupPrefix + currentId);
            if (groupObjAngleBetween) groupObjAngleBetween.remove();
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
