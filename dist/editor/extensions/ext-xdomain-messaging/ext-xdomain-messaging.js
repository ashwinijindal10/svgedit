var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function createCommonjsModule(t){var r={exports:{}};return t(r,r.exports),r.exports}var check=function(t){return t&&t.Math==Math&&t},r=check("object"==typeof globalThis&&globalThis)||check("object"==typeof window&&window)||check("object"==typeof self&&self)||check("object"==typeof t&&t)||function(){return this}()||Function("return this")(),fails=function(t){try{return!!t()}catch(t){return!0}},e=!fails((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),n={}.propertyIsEnumerable,o=Object.getOwnPropertyDescriptor,i={f:o&&!n.call({1:2},1)?function propertyIsEnumerable(t){var r=o(this,t);return!!r&&r.enumerable}:n},createPropertyDescriptor=function(t,r){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:r}},c={}.toString,classofRaw=function(t){return c.call(t).slice(8,-1)},u="".split,a=fails((function(){return!Object("z").propertyIsEnumerable(0)}))?function(t){return"String"==classofRaw(t)?u.call(t,""):Object(t)}:Object,requireObjectCoercible=function(t){if(null==t)throw TypeError("Can't call method on "+t);return t},toIndexedObject=function(t){return a(requireObjectCoercible(t))},isObject=function(t){return"object"==typeof t?null!==t:"function"==typeof t},toPrimitive=function(t,r){if(!isObject(t))return t;var e,n;if(r&&"function"==typeof(e=t.toString)&&!isObject(n=e.call(t)))return n;if("function"==typeof(e=t.valueOf)&&!isObject(n=e.call(t)))return n;if(!r&&"function"==typeof(e=t.toString)&&!isObject(n=e.call(t)))return n;throw TypeError("Can't convert object to primitive value")},f={}.hasOwnProperty,has=function(t,r){return f.call(t,r)},l=r.document,s=isObject(l)&&isObject(l.createElement),documentCreateElement=function(t){return s?l.createElement(t):{}},p=!e&&!fails((function(){return 7!=Object.defineProperty(documentCreateElement("div"),"a",{get:function(){return 7}}).a})),y=Object.getOwnPropertyDescriptor,d={f:e?y:function getOwnPropertyDescriptor(t,r){if(t=toIndexedObject(t),r=toPrimitive(r,!0),p)try{return y(t,r)}catch(t){}if(has(t,r))return createPropertyDescriptor(!i.f.call(t,r),t[r])}},anObject=function(t){if(!isObject(t))throw TypeError(String(t)+" is not an object");return t},g=Object.defineProperty,m={f:e?g:function defineProperty(t,r,e){if(anObject(t),r=toPrimitive(r,!0),anObject(e),p)try{return g(t,r,e)}catch(t){}if("get"in e||"set"in e)throw TypeError("Accessors not supported");return"value"in e&&(t[r]=e.value),t}},h=e?function(t,r,e){return m.f(t,r,createPropertyDescriptor(1,e))}:function(t,r,e){return t[r]=e,t},setGlobal=function(t,e){try{h(r,t,e)}catch(n){r[t]=e}return e},v=r["__core-js_shared__"]||setGlobal("__core-js_shared__",{}),b=Function.toString;"function"!=typeof v.inspectSource&&(v.inspectSource=function(t){return b.call(t)});var S,w,O,j=v.inspectSource,A=r.WeakMap,_="function"==typeof A&&/native code/.test(j(A)),E=createCommonjsModule((function(t){(t.exports=function(t,r){return v[t]||(v[t]=void 0!==r?r:{})})("versions",[]).push({version:"3.8.3",mode:"global",copyright:"© 2021 Denis Pushkarev (zloirock.ru)"})})),T=0,x=Math.random(),uid=function(t){return"Symbol("+String(void 0===t?"":t)+")_"+(++T+x).toString(36)},C=E("keys"),sharedKey=function(t){return C[t]||(C[t]=uid(t))},P={},M=r.WeakMap;if(_){var I=v.state||(v.state=new M),k=I.get,L=I.has,F=I.set;S=function(t,r){return r.facade=t,F.call(I,t,r),r},w=function(t){return k.call(I,t)||{}},O=function(t){return L.call(I,t)}}else{var N=sharedKey("state");P[N]=!0,S=function(t,r){return r.facade=t,h(t,N,r),r},w=function(t){return has(t,N)?t[N]:{}},O=function(t){return has(t,N)}}var R,W,D={set:S,get:w,has:O,enforce:function(t){return O(t)?w(t):S(t,{})},getterFor:function(t){return function(r){var e;if(!isObject(r)||(e=w(r)).type!==t)throw TypeError("Incompatible receiver, "+t+" required");return e}}},z=createCommonjsModule((function(t){var e=D.get,n=D.enforce,o=String(String).split("String");(t.exports=function(t,e,i,c){var u,a=!!c&&!!c.unsafe,f=!!c&&!!c.enumerable,l=!!c&&!!c.noTargetGet;"function"==typeof i&&("string"!=typeof e||has(i,"name")||h(i,"name",e),(u=n(i)).source||(u.source=o.join("string"==typeof e?e:""))),t!==r?(a?!l&&t[e]&&(f=!0):delete t[e],f?t[e]=i:h(t,e,i)):f?t[e]=i:setGlobal(e,i)})(Function.prototype,"toString",(function toString(){return"function"==typeof this&&e(this).source||j(this)}))})),G=r,aFunction=function(t){return"function"==typeof t?t:void 0},getBuiltIn=function(t,e){return arguments.length<2?aFunction(G[t])||aFunction(r[t]):G[t]&&G[t][e]||r[t]&&r[t][e]},J=Math.ceil,K=Math.floor,toInteger=function(t){return isNaN(t=+t)?0:(t>0?K:J)(t)},q=Math.min,toLength=function(t){return t>0?q(toInteger(t),9007199254740991):0},B=Math.max,H=Math.min,createMethod=function(t){return function(r,e,n){var o,i=toIndexedObject(r),c=toLength(i.length),u=function(t,r){var e=toInteger(t);return e<0?B(e+r,0):H(e,r)}(n,c);if(t&&e!=e){for(;c>u;)if((o=i[u++])!=o)return!0}else for(;c>u;u++)if((t||u in i)&&i[u]===e)return t||u||0;return!t&&-1}},U={includes:createMethod(!0),indexOf:createMethod(!1)},V=U.indexOf,objectKeysInternal=function(t,r){var e,n=toIndexedObject(t),o=0,i=[];for(e in n)!has(P,e)&&has(n,e)&&i.push(e);for(;r.length>o;)has(n,e=r[o++])&&(~V(i,e)||i.push(e));return i},X=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Y=X.concat("length","prototype"),$={f:Object.getOwnPropertyNames||function getOwnPropertyNames(t){return objectKeysInternal(t,Y)}},Q={f:Object.getOwnPropertySymbols},Z=getBuiltIn("Reflect","ownKeys")||function ownKeys(t){var r=$.f(anObject(t)),e=Q.f;return e?r.concat(e(t)):r},copyConstructorProperties=function(t,r){for(var e=Z(r),n=m.f,o=d.f,i=0;i<e.length;i++){var c=e[i];has(t,c)||n(t,c,o(r,c))}},tt=/#|\.prototype\./,isForced=function(t,r){var e=et[rt(t)];return e==ot||e!=nt&&("function"==typeof r?fails(r):!!r)},rt=isForced.normalize=function(t){return String(t).replace(tt,".").toLowerCase()},et=isForced.data={},nt=isForced.NATIVE="N",ot=isForced.POLYFILL="P",it=isForced,ct=d.f,_export=function(t,e){var n,o,i,c,u,a=t.target,f=t.global,l=t.stat;if(n=f?r:l?r[a]||setGlobal(a,{}):(r[a]||{}).prototype)for(o in e){if(c=e[o],i=t.noTargetGet?(u=ct(n,o))&&u.value:n[o],!it(f?o:a+(l?".":"#")+o,t.forced)&&void 0!==i){if(typeof c==typeof i)continue;copyConstructorProperties(c,i)}(t.sham||i&&i.sham)&&h(c,"sham",!0),z(n,o,c,t)}},ut=Array.isArray||function isArray(t){return"Array"==classofRaw(t)},toObject=function(t){return Object(requireObjectCoercible(t))},createProperty=function(t,r,e){var n=toPrimitive(r);n in t?m.f(t,n,createPropertyDescriptor(0,e)):t[n]=e},at=!!Object.getOwnPropertySymbols&&!fails((function(){return!String(Symbol())})),ft=at&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,lt=E("wks"),st=r.Symbol,pt=ft?st:st&&st.withoutSetter||uid,wellKnownSymbol=function(t){return has(lt,t)||(at&&has(st,t)?lt[t]=st[t]:lt[t]=pt("Symbol."+t)),lt[t]},yt=wellKnownSymbol("species"),arraySpeciesCreate=function(t,r){var e;return ut(t)&&("function"!=typeof(e=t.constructor)||e!==Array&&!ut(e.prototype)?isObject(e)&&null===(e=e[yt])&&(e=void 0):e=void 0),new(void 0===e?Array:e)(0===r?0:r)},dt=getBuiltIn("navigator","userAgent")||"",gt=r.process,mt=gt&&gt.versions,ht=mt&&mt.v8;ht?W=(R=ht.split("."))[0]+R[1]:dt&&(!(R=dt.match(/Edge\/(\d+)/))||R[1]>=74)&&(R=dt.match(/Chrome\/(\d+)/))&&(W=R[1]);var vt,bt=W&&+W,St=wellKnownSymbol("species"),wt=wellKnownSymbol("isConcatSpreadable"),Ot=bt>=51||!fails((function(){var t=[];return t[wt]=!1,t.concat()[0]!==t})),jt=(vt="concat",bt>=51||!fails((function(){var t=[];return(t.constructor={})[St]=function(){return{foo:1}},1!==t[vt](Boolean).foo}))),isConcatSpreadable=function(t){if(!isObject(t))return!1;var r=t[wt];return void 0!==r?!!r:ut(t)};_export({target:"Array",proto:!0,forced:!Ot||!jt},{concat:function concat(t){var r,e,n,o,i,c=toObject(this),u=arraySpeciesCreate(c,0),a=0;for(r=-1,n=arguments.length;r<n;r++)if(isConcatSpreadable(i=-1===r?c:arguments[r])){if(a+(o=toLength(i.length))>9007199254740991)throw TypeError("Maximum allowed index exceeded");for(e=0;e<o;e++,a++)e in i&&createProperty(u,a,i[e])}else{if(a>=9007199254740991)throw TypeError("Maximum allowed index exceeded");createProperty(u,a++,i)}return u.length=a,u}});var At,_t=Object.keys||function keys(t){return objectKeysInternal(t,X)},Et=e?Object.defineProperties:function defineProperties(t,r){anObject(t);for(var e,n=_t(r),o=n.length,i=0;o>i;)m.f(t,e=n[i++],r[e]);return t},Tt=getBuiltIn("document","documentElement"),xt=sharedKey("IE_PROTO"),EmptyConstructor=function(){},scriptTag=function(t){return"<script>"+t+"<\/script>"},NullProtoObject=function(){try{At=document.domain&&new ActiveXObject("htmlfile")}catch(t){}var t,r;NullProtoObject=At?function(t){t.write(scriptTag("")),t.close();var r=t.parentWindow.Object;return t=null,r}(At):((r=documentCreateElement("iframe")).style.display="none",Tt.appendChild(r),r.src=String("javascript:"),(t=r.contentWindow.document).open(),t.write(scriptTag("document.F=Object")),t.close(),t.F);for(var e=X.length;e--;)delete NullProtoObject.prototype[X[e]];return NullProtoObject()};P[xt]=!0;var Ct=Object.create||function create(t,r){var e;return null!==t?(EmptyConstructor.prototype=anObject(t),e=new EmptyConstructor,EmptyConstructor.prototype=null,e[xt]=t):e=NullProtoObject(),void 0===r?e:Et(e,r)},Pt=wellKnownSymbol("unscopables"),Mt=Array.prototype;null==Mt[Pt]&&m.f(Mt,Pt,{configurable:!0,value:Ct(null)});var It,kt=Object.defineProperty,Lt={},thrower=function(t){throw t},Ft=U.includes;_export({target:"Array",proto:!0,forced:!function(t,r){if(has(Lt,t))return Lt[t];r||(r={});var n=[][t],o=!!has(r,"ACCESSORS")&&r.ACCESSORS,i=has(r,0)?r[0]:thrower,c=has(r,1)?r[1]:void 0;return Lt[t]=!!n&&!fails((function(){if(o&&!e)return!0;var t={length:-1};o?kt(t,1,{enumerable:!0,get:thrower}):t[1]=1,n.call(t,i,c)}))}("indexOf",{ACCESSORS:!0,1:0})},{includes:function includes(t){return Ft(this,t,arguments.length>1?arguments[1]:void 0)}}),It="includes",Mt[Pt][It]=!0;var Nt=m.f,Rt=Function.prototype,Wt=Rt.toString,Dt=/^\s*function ([^ (]*)/;e&&!("name"in Rt)&&Nt(Rt,"name",{configurable:!0,get:function(){try{return Wt.call(this).match(Dt)[1]}catch(t){return""}}});var zt=wellKnownSymbol("match"),notARegexp=function(t){if(function(t){var r;return isObject(t)&&(void 0!==(r=t[zt])?!!r:"RegExp"==classofRaw(t))}(t))throw TypeError("The method doesn't accept regular expressions");return t},Gt=wellKnownSymbol("match");function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function _toConsumableArray(t){return function _arrayWithoutHoles(t){if(Array.isArray(t))return _arrayLikeToArray(t)}(t)||function _iterableToArray(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(t)||function _unsupportedIterableToArray(t,r){if(!t)return;if("string"==typeof t)return _arrayLikeToArray(t,r);var e=Object.prototype.toString.call(t).slice(8,-1);"Object"===e&&t.constructor&&(e=t.constructor.name);if("Map"===e||"Set"===e)return Array.from(t);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return _arrayLikeToArray(t,r)}(t)||function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray(t,r){(null==r||r>t.length)&&(r=t.length);for(var e=0,n=new Array(r);e<r;e++)n[e]=t[e];return n}_export({target:"String",proto:!0,forced:!function(t){var r=/./;try{"/./"[t](r)}catch(e){try{return r[Gt]=!1,"/./"[t](r)}catch(t){}}return!1}("includes")},{includes:function includes(t){return!!~String(requireObjectCoercible(this)).indexOf(notARegexp(t),arguments.length>1?arguments[1]:void 0)}});var Jt={name:"xdomain-messaging",init:function init(){var t=this,r=t.svgCanvas;try{window.addEventListener("message",(function(e){if(e.data&&["string","object"].includes(_typeof(e.data))&&"|"!==e.data.charAt()){var n="object"===_typeof(e.data)?e.data:JSON.parse(e.data);if(n&&"object"===_typeof(n)&&"svgCanvas"===n.namespace){var o=t.configObj.curConfig.allowedOrigins;if(o.includes("*")||o.includes(e.origin)){var i=n.id,c=n.name,u=n.args,a={namespace:"svg-edit",id:i};try{a.result=r[c].apply(r,_toConsumableArray(u))}catch(t){a.error=t.message}e.source.postMessage(JSON.stringify(a),"*")}else console.log("Origin ".concat(e.origin," not whitelisted for posting to ").concat(window.origin))}}}))}catch(t){console.log("Error with xdomain message listener: "+t)}}};export default Jt;
//# sourceMappingURL=ext-xdomain-messaging.js.map
