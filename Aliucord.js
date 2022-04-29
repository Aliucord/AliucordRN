var aliu = (function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  const DiscordLogger = getByProps("setLogFn").default;
  let Logger = /*#__PURE__*/function (_DiscordLogger) {
    _inherits(Logger, _DiscordLogger);

    var _super = _createSuper(Logger);

    function Logger(tag) {
      var _this;

      _classCallCheck(this, Logger);

      _this = _super.call(this, `Aliucord:${tag}`);
      _this.tag = tag;

      const {
        log,
        info,
        warn,
        error,
        trace,
        verbose
      } = _assertThisInitialized(_this);

      _this.log = (...messages) => {
        log(...messages);

        _this._log(console.log, messages);
      };

      _this.info = (...messages) => {
        info(...messages);

        _this._log(console.info, messages);
      };

      _this.warn = (...messages) => {
        warn(...messages);

        _this._log(console.warn, messages);
      };

      _this.error = (...messages) => {
        error(...messages);

        _this._log(console.error, messages);
      };

      _this.trace = (...messages) => {
        trace(...messages);

        _this._log(console.trace, messages);
      };

      _this.verbose = (...messages) => {
        verbose(...messages);

        _this._log(console.debug, messages);
      };

      return _this;
    }

    _createClass(Logger, [{
      key: "_log",
      value: function _log(log, messages) {
        var _a;

        log(`[${this.tag}]`);

        for (const msg of messages) {
          if (msg instanceof Error) log((_a = msg.stack) != null ? _a : msg.message);else log(msg);
        }
      }
    }]);

    return Logger;
  }(DiscordLogger);

  const logger$3 = new Logger("Metro");

  function isModuleBlacklisted(id) {
    if (id === 54 || id >= 966 && id <= 994) return true;
    return false;
  }

  function getModule(filter, options) {
    const {
      exports = true,
      default: defaultExport = true
    } = options != null ? options : {};

    for (const key in modules) {
      const id = Number(key);
      if (isModuleBlacklisted(id)) continue;
      let mod;

      try {
        mod = __r(id);
      } catch (e) {}

      if (!mod) continue;

      try {
        if (filter(mod)) {
          const module = modules[id].publicModule;
          return exports ? module.exports : module;
        }

        if (mod.default && filter(mod.default)) {
          const module = modules[id].publicModule;
          return defaultExport ? module.exports.default : exports ? module.exports : module;
        }
      } catch (e) {
        logger$3.error("Error during getModule", e);
      }
    }

    return null;
  }
  function getByProps(...props) {
    if (!props.length) return null;
    const options = typeof props[props.length - 1] === "object" ? props.pop() : {};

    const filter = module => {
      for (let i = 0, len = props.length; i < len; i++) if (module[props[i]] === void 0) return false;

      return true;
    };

    return getModule(filter, typeof options === "boolean" ? {
      default: options
    } : options);
  }
  function getByDisplayName(displayName, options) {
    return getModule(m => m.displayName === displayName, options);
  }
  function getByStoreName(storeName, options) {
    return getModule(m => {
      var _a;

      return ((_a = m.getName) == null ? void 0 : _a.call(m)) === storeName;
    }, options);
  }
  const getById = __r;
  function getAll(filter, options) {
    const {
      exports = true,
      default: defaultExport = true
    } = options != null ? options : {};
    const ret = [];

    for (const key in modules) {
      const id = Number(key);
      if (isModuleBlacklisted(id)) continue;
      let mod;

      try {
        mod = __r(id);
      } catch (e) {}

      if (!mod) continue;

      try {
        if (filter(mod)) {
          const module = modules[Number(id)].publicModule;
          ret.push(exports ? module.exports : module);
        }

        if (mod.default && filter(mod.default)) {
          const module = modules[Number(id)].publicModule;
          return defaultExport ? module.exports.default : exports ? module.exports : module;
        }
      } catch (e) {
        logger$3.error("Error during getAll", e);
      }
    }

    return ret;
  }
  function getAllByProps(...props) {
    if (!props.length) return [];
    const options = typeof props[props.length - 1] === "object" ? props.pop() : {};

    const filter = module => {
      for (let i = 0, len = props.length; i < len; i++) if (module[props[i]] === void 0) return false;

      return true;
    };

    return getAll(filter, typeof options === "boolean" ? {
      default: options
    } : options);
  }
  function searchByKeyword(keyword, skipConstants = true) {
    var _a, _b;

    keyword = keyword.toLowerCase();
    const matches = [];
    window.moduleSearchResults = {};

    function check(obj) {
      if (!obj) return;

      for (const name of Object.getOwnPropertyNames(obj)) {
        if (name.toLowerCase().includes(keyword) && (!skipConstants || name.toUpperCase() !== name)) {
          matches.push(name);
          window.moduleSearchResults[name] = obj;
        }
      }
    }

    for (const id in modules) if (!isModuleBlacklisted(Number(id))) {
      try {
        __r(Number(id));

        const mod = (_a = modules[id]) == null ? void 0 : _a.publicModule;

        if (mod) {
          check(mod);
          check(mod.exports);
          check((_b = mod.exports) == null ? void 0 : _b.default);
        }
      } catch (e) {}
    }

    return matches;
  }
  const UserStore = getByStoreName("UserStore");
  const GuildStore = getByStoreName("GuildStore");
  const ChannelStore = getByStoreName("ChannelStore");
  const MessageStore = getByStoreName("MessageStore");
  const GuildMemberStore = getByStoreName("GuildMemberStore");
  const SelectedChannelStore = getByStoreName("SelectedChannelStore");
  const ModalActions = getByProps("closeModal");
  const MessageActions = getByProps("sendMessage", "receiveMessage");
  const FluxDispatcher = getByProps("dirtyDispatch");
  const FetchUserActions = getByProps("fetchProfile");
  const ContextMenuActions = getByProps("openContextMenu");
  const Clipboard = getByProps("getString", "setString");
  const RestAPI = getByProps("getAPIBaseURL", "get");
  const i18n = getByProps("Messages");
  const Flux = getByProps("connectStores");
  const React = getByProps("createElement");
  const ReactNative = getByProps("Text", "Image");
  const Constants = getByProps("ActionTypes");
  const URLOpener = getByProps("openURL", "handleSupportedURL");
  const Forms = getByProps("FormSection");
  const Styles = getByProps("createThemedStyleSheet");

  var index$4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getModule: getModule,
    getByProps: getByProps,
    getByDisplayName: getByDisplayName,
    getByStoreName: getByStoreName,
    getById: getById,
    getAll: getAll,
    getAllByProps: getAllByProps,
    searchByKeyword: searchByKeyword,
    UserStore: UserStore,
    GuildStore: GuildStore,
    ChannelStore: ChannelStore,
    MessageStore: MessageStore,
    GuildMemberStore: GuildMemberStore,
    SelectedChannelStore: SelectedChannelStore,
    ModalActions: ModalActions,
    MessageActions: MessageActions,
    FluxDispatcher: FluxDispatcher,
    FetchUserActions: FetchUserActions,
    ContextMenuActions: ContextMenuActions,
    Clipboard: Clipboard,
    RestAPI: RestAPI,
    i18n: i18n,
    Flux: Flux,
    React: React,
    ReactNative: ReactNative,
    Constants: Constants,
    URLOpener: URLOpener,
    Forms: Forms,
    Styles: Styles
  });

  var __async$4 = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = value => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };

      var rejected = value => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };

      var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

      step((generator = generator.apply(__this, __arguments)).next());
    });
  };
  function useSettings(settings) {
    const [, update] = React.useState(0);
    return React.useMemo(() => ({
      get(key, defaultValue) {
        return settings.get(key, defaultValue);
      },

      set(key, value) {
        settings.set(key, value).then(() => update(x => x + 1));
      }

    }), []);
  }
  let Settings = /*#__PURE__*/function () {
    function Settings(module, snapshot) {
      _classCallCheck(this, Settings);

      this.module = module;
      this.snapshot = snapshot;
    }

    _createClass(Settings, [{
      key: "get",
      value: function get(key, defaultValue) {
        var _a;

        return (_a = this.snapshot[key]) != null ? _a : defaultValue;
      }
    }, {
      key: "set",
      value: function set(key, value) {
        return __async$4(this, null, function* () {
          const {
            snapshot
          } = this;
          snapshot[key] = value;
          return this._persist();
        });
      }
    }, {
      key: "delete",
      value: function _delete(key) {
        return __async$4(this, null, function* () {
          if (key in this.snapshot) {
            delete this.snapshot[key];
            return this._persist();
          }
        });
      }
    }, {
      key: "_persist",
      value: function _persist() {
        return window.nativeModuleProxy.AliucordNative.writeSettings(this.module, JSON.stringify(this.snapshot, null, 2));
      }
    }], [{
      key: "make",
      value: function make(module) {
        return __async$4(this, null, function* () {
          var _a;

          const snapshot = (_a = yield window.nativeModuleProxy.AliucordNative.getSettings(module)) != null ? _a : "{}";

          try {
            const data = JSON.parse(snapshot);
            if (typeof data !== "object") throw new Error("JSON data was not an object.");
            return new this(module, data);
          } catch (err) {
            window.Aliucord.logger.error(`[SettingsAPI] Settings of module ${module} are corrupt and were cleared.`);
            return new this(module, {});
          }
        });
      }
    }]);

    return Settings;
  }();

  var ApplicationCommandInputType = /* @__PURE__ */(ApplicationCommandInputType2 => {
    ApplicationCommandInputType2[ApplicationCommandInputType2["BUILT_IN"] = 0] = "BUILT_IN";
    ApplicationCommandInputType2[ApplicationCommandInputType2["BUILT_IN_TEXT"] = 1] = "BUILT_IN_TEXT";
    ApplicationCommandInputType2[ApplicationCommandInputType2["BUILT_IN_INTEGRATION"] = 2] = "BUILT_IN_INTEGRATION";
    ApplicationCommandInputType2[ApplicationCommandInputType2["BOT"] = 3] = "BOT";
    ApplicationCommandInputType2[ApplicationCommandInputType2["PLACEHOLDER"] = 4] = "PLACEHOLDER";
    return ApplicationCommandInputType2;
  })(ApplicationCommandInputType || {});
  var ApplicationCommandOptionType = /* @__PURE__ */(ApplicationCommandOptionType2 => {
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["SUB_COMMAND"] = 1] = "SUB_COMMAND";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["SUB_COMMAND_GROUP"] = 2] = "SUB_COMMAND_GROUP";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["STRING"] = 3] = "STRING";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["INTEGER"] = 4] = "INTEGER";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["BOOLEAN"] = 5] = "BOOLEAN";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["USER6"] = 6] = "USER6";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["CHANNEL"] = 7] = "CHANNEL";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["ROLE"] = 8] = "ROLE";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["MENTIONABLE"] = 9] = "MENTIONABLE";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["NUMBER"] = 10] = "NUMBER";
    ApplicationCommandOptionType2[ApplicationCommandOptionType2["ATTACHMENT"] = 11] = "ATTACHMENT";
    return ApplicationCommandOptionType2;
  })(ApplicationCommandOptionType || {});
  var ApplicationCommandType = /* @__PURE__ */(ApplicationCommandType2 => {
    ApplicationCommandType2[ApplicationCommandType2["CHAT"] = 1] = "CHAT";
    ApplicationCommandType2[ApplicationCommandType2["USER"] = 2] = "USER";
    ApplicationCommandType2[ApplicationCommandType2["MESSAGE"] = 3] = "MESSAGE";
    return ApplicationCommandType2;
  })(ApplicationCommandType || {});
  const SnowflakeUtils = getByProps("fromTimestamp");

  const _Commands = /*#__PURE__*/function () {
    function _Commands(plugin) {
      _classCallCheck(this, _Commands);

      this.plugin = plugin;
    }

    _createClass(_Commands, [{
      key: "registerCommand",
      value: function registerCommand(command) {
        command.id = _Commands.generateId();
        command.applicationId = _Commands._aliucordSection.id;
        command.displayName = command.name;
        command.displayDescription = command.description;
        command.inputType = 0
        /* BUILT_IN */
        ;
        command.type = 1
        /* CHAT */
        ;
        command.__plugin = this.plugin;

        for (const option of command.options) {
          option.displayName = option.name;
          option.displayDescription = option.description;
        }

        _Commands._commands.push(command);
      }
    }, {
      key: "unregisterAll",
      value: function unregisterAll() {
        _Commands._commands = _Commands._commands.filter(c => c.__plugin !== this.plugin);
      }
    }]);

    return _Commands;
  }();

  let Commands = _Commands;
  Commands._idIncrementNum = Date.now();

  Commands.generateId = () => `-${SnowflakeUtils.fromTimestamp(_Commands._idIncrementNum++)}`;

  Commands._aliucordSection = {
    id: _Commands.generateId(),
    name: "Aliucord"
  };
  Commands._commands = [];

  const logger$2 = new Logger("Patcher");
  const patchInfoSym = "__ALIUCORD_PATCH_INFO__";
  var PatchPriority = /* @__PURE__ */(PatchPriority2 => {
    PatchPriority2[PatchPriority2["MIN"] = 0] = "MIN";
    PatchPriority2[PatchPriority2["DEFAULT"] = 15] = "DEFAULT";
    PatchPriority2[PatchPriority2["MAX"] = 30] = "MAX";
    return PatchPriority2;
  })(PatchPriority || {});
  let Patch = /*#__PURE__*/_createClass(function Patch(data, priority = 15
  /* DEFAULT */
  , plugin) {
    _classCallCheck(this, Patch);

    this.priority = priority;
    this.plugin = plugin;

    var _a, _b;

    if (this.priority < 0
    /* MIN */
    || this.priority > 30
    /* MAX */
    ) {
      throw new Error("Priority must be between PatchPriority.MIN and PatchPriority.MAX");
    }

    const defaultFn = () => void 0;

    if (data.instead) {
      if (data.after || data.before) {
        throw new Error("Instead patches cannot specify before or after patches.");
      }

      const {
        instead: instead2
      } = data;

      this.before = (ctx, ...args) => {
        ctx.result = instead2(ctx, ...args);
      };

      this.after = defaultFn;
    } else {
      this.before = (_a = data.before) != null ? _a : defaultFn;
      this.after = (_b = data.after) != null ? _b : defaultFn;
    }
  });

  let PatchInfo = /*#__PURE__*/function () {
    function PatchInfo(backup, methodName) {
      _classCallCheck(this, PatchInfo);

      this.backup = backup;
      this.methodName = methodName;
      this._patches = [];
    }

    _createClass(PatchInfo, [{
      key: "error",
      value: function error(patch2, type, _error) {
        const message = (patch2.plugin ? `[${patch2.plugin}] ` : "") + `Error during ${this.methodName} ${type}
`;
        logger$2.error(message, _error);
      }
    }, {
      key: "patchCount",
      get: function () {
        return this._patches.length;
      }
    }, {
      key: "addPatch",
      value: function addPatch(patch2) {
        if (this._patches.includes(patch2)) return false;

        this._patches.push(patch2);

        this._patches.sort((a, b) => b.priority - a.priority);

        return true;
      }
    }, {
      key: "removePatch",
      value: function removePatch(patch2) {
        const idx = this._patches.indexOf(patch2);

        if (idx === -1) return false;

        this._patches.splice(idx, 1);

        return true;
      }
    }, {
      key: "makeReplacementFunc",
      value: function makeReplacementFunc() {
        const _this = this;

        return function AliucordPatchFn(...args) {
          return _this._callback(this, ...args);
        };
      }
    }, {
      key: "_callback",
      value: function _callback(thisObject, ...args) {
        const patches = this._patches;
        if (!patches.length) return this.backup.call(thisObject, ...args);
        const ctx = new PatchContext(thisObject, args, this.backup);
        let idx = 0;

        do {
          try {
            const result = patches[idx].before(ctx, ...ctx.args);
            if (result !== void 0) ctx.result = result;
          } catch (err) {
            this.error(patches[idx], "PrePatch", err);
            ctx.result = void 0;
            ctx._returnEarly = false;
            continue;
          }

          if (ctx._returnEarly) {
            idx++;
            break;
          }
        } while (++idx < patches.length);

        if (!ctx._returnEarly) {
          try {
            ctx.result = this.backup.call(ctx.thisObject, ...ctx.args);
          } catch (err) {
            ctx.error = err;
          }
        }

        idx--;

        do {
          const lastRes = ctx.result;
          const lastError = ctx.error;

          try {
            const result = patches[idx].after(ctx, ctx.result, ...ctx.args);
            if (result !== void 0) ctx.result = result;
          } catch (err) {
            this.error(patches[idx], "PostPatch", err);

            if (lastError !== null) {
              ctx.error = lastError;
            } else {
              ctx.result = lastRes;
            }
          }
        } while (--idx >= 0);

        return ctx.getResultOrThrowError();
      }
    }]);

    return PatchInfo;
  }();

  let PatchContext = /*#__PURE__*/function () {
    function PatchContext(thisObject, args, backup) {
      _classCallCheck(this, PatchContext);

      this.thisObject = thisObject;
      this.args = args;
      this.backup = backup;
      this._returnEarly = false;
    }

    _createClass(PatchContext, [{
      key: "result",
      get: function () {
        return this._result;
      },
      set: function (value) {
        this._result = value;
        this._error = void 0;
        this._returnEarly = true;
      }
    }, {
      key: "error",
      get: function () {
        return this._error;
      },
      set: function (error) {
        this._returnEarly = error !== void 0;
        this._error = error;
      }
    }, {
      key: "getResultOrThrowError",
      value: function getResultOrThrowError() {
        if (this._error !== void 0) throw this._error;
        return this._result;
      }
    }, {
      key: "callOriginal",
      value: function callOriginal() {
        return _callOriginal(this.backup, this.thisObject, this.args);
      }
    }]);

    return PatchContext;
  }();

  function resolveMethod(obj, methodName) {
    if (obj == null) throw new Error("obj may not be null or undefined");
    if (typeof methodName !== "string" || !methodName) throw new Error("methodName must be a non empty string");
    const method = obj[methodName];
    if (method == null) throw new Error("No such method: " + methodName);
    if (typeof method !== "function") throw new Error(methodName + " is not a function");
    return method;
  }

  function unpatch(obj, methodName, patch2) {
    const func = resolveMethod(obj, methodName);
    const patchInfo = func[patchInfoSym];

    if (patchInfo) {
      patchInfo.removePatch(patch2);

      if (patchInfo.patchCount === 0) {
        obj[methodName] = patchInfo.backup;
      }
    }
  }

  function _callOriginal(func, thisObj, ...args) {
    var _a;

    if (func == null || typeof func !== "function") throw new Error("Not a function: " + func);
    const patchInfo = func[patchInfoSym];
    const original = (_a = patchInfo == null ? void 0 : patchInfo.backup) != null ? _a : func;
    return original.call(thisObj, ...args);
  }
  function patch(object, name, patch2) {
    const original = resolveMethod(object, name);
    let patchInfo = original[patchInfoSym];

    if (!patchInfo) {
      patchInfo = new PatchInfo(original, name);
      const replacement = patchInfo.makeReplacementFunc();
      Object.defineProperty(replacement, patchInfoSym, {
        value: patchInfo,
        enumerable: false,
        writable: true,
        configurable: true
      });
      Object.defineProperties(replacement, Object.getOwnPropertyDescriptors(original));
      object[name] = replacement;
    }

    patchInfo.addPatch(patch2);
    return () => unpatch(object, name, patch2);
  }
  function before(object, name, before2, priority = 15
  /* DEFAULT */
  , plugin) {
    return patch(object, name, new Patch({
      before: before2
    }, priority, plugin));
  }
  function instead(object, name, instead2, priority = 15
  /* DEFAULT */
  , plugin) {
    return patch(object, name, new Patch({
      instead: instead2
    }, priority, plugin));
  }
  function insteadDoNothing(object, name) {
    return instead(object, name, () => void 0);
  }
  function after(object, name, after2, priority = 15
  /* DEFAULT */
  , plugin) {
    return patch(object, name, new Patch({
      after: after2
    }, priority, plugin));
  }

  var patcher = /*#__PURE__*/Object.freeze({
    __proto__: null,
    PatchPriority: PatchPriority,
    Patch: Patch,
    unpatch: unpatch,
    callOriginal: _callOriginal,
    patch: patch,
    before: before,
    instead: instead,
    insteadDoNothing: insteadDoNothing,
    after: after
  });

  let Patcher = /*#__PURE__*/function () {
    function Patcher(plugin) {
      _classCallCheck(this, Patcher);

      this.plugin = plugin;
      this._unpatches = [];
    }

    _createClass(Patcher, [{
      key: "before",
      value: function before$1(object, name, fn, priority) {
        const unpatch = before(object, name, fn, priority, this.plugin);

        this._unpatches.push(unpatch);

        return unpatch;
      }
    }, {
      key: "instead",
      value: function instead$1(object, name, fn, priority) {
        const unpatch = instead(object, name, fn, priority, this.plugin);

        this._unpatches.push(unpatch);

        return unpatch;
      }
    }, {
      key: "insteadDoNothing",
      value: function insteadDoNothing$1(object, name) {
        const unpatch = insteadDoNothing(object, name);

        this._unpatches.push(unpatch);

        return unpatch;
      }
    }, {
      key: "after",
      value: function after$1(object, name, fn, priority) {
        const unpatch = after(object, name, fn, priority, this.plugin);

        this._unpatches.push(unpatch);

        return unpatch;
      }
    }, {
      key: "unpatchAll",
      value: function unpatchAll() {
        let unpatch;

        while (unpatch = this._unpatches.pop()) {
          unpatch();
        }
      }
    }]);

    return Patcher;
  }();

  let Plugin = /*#__PURE__*/function () {
    function Plugin(settings) {
      _classCallCheck(this, Plugin);

      this.settings = settings;
      this.commands = new Commands(this.name);
      this.logger = new Logger(this.name);
      this.patcher = new Patcher(this.name);
    }

    _createClass(Plugin, [{
      key: "name",
      get: function () {
        return this.constructor.name;
      }
    }, {
      key: "start",
      value: function start() {}
    }, {
      key: "stop",
      value: function stop() {
        this.commands.unregisterAll();
        this.patcher.unpatchAll();
      }
    }]);

    return Plugin;
  }();

  let CommandHandler = /*#__PURE__*/function (_Plugin) {
    _inherits(CommandHandler, _Plugin);

    var _super = _createSuper(CommandHandler);

    function CommandHandler() {
      _classCallCheck(this, CommandHandler);

      return _super.apply(this, arguments);
    }

    _createClass(CommandHandler, [{
      key: "start",
      value: function start() {
        const commands = getByProps("getBuiltInCommands");
        after(commands, "getBuiltInCommands", context => [...context.result, ...Commands._commands]);
        const discovery = getByProps("useApplicationCommandsDiscoveryState");
        after(discovery, "useApplicationCommandsDiscoveryState", context => {
          const shouldDisplay = context.args[3] === false;
          const res = context.result;

          if (shouldDisplay && !res.discoverySections.find(s => s.key === Commands._aliucordSection.id) && Commands._commands.length) {
            res.discoveryCommands.push(...Commands._commands);
            res.commands.push(...Commands._commands.filter(command => !res.commands.some(cmd => cmd.name === command.name)));
            res.discoverySections.push({
              data: Commands._commands,
              key: Commands._aliucordSection.id,
              section: Commands._aliucordSection
            });
            const offsets = res.sectionsOffset;
            offsets.push(offsets[offsets.length - 1] + commands.BUILT_IN_COMMANDS.length - 1);
          }

          if (shouldDisplay && !res.applicationCommandSections.find(s => s.id === Commands._aliucordSection.id) && Commands._commands.length) {
            res.applicationCommandSections.push(Commands._aliucordSection);
          }
        });
      }
    }]);

    return CommandHandler;
  }(Plugin);

  const sha = "d302733";

  const DebugInfo = {
    get discordVersion() {
      try {
        return `${ReactNative.NativeModules.InfoDictionaryManager.Version} (${ReactNative.NativeModules.InfoDictionaryManager.ReleaseChannel})`;
      } catch (ex) {
        return "unknown";
      }
    },

    get system() {
      try {
        return `${ReactNative.Platform.OS} ${ReactNative.Platform.constants.Release} (SDK v${ReactNative.Platform.Version}) ${ReactNative.NativeModules.DCDDeviceManager.device} ${ReactNative.Platform.constants.uiMode}`;
      } catch (ex) {
        return "unknown";
      }
    },

    get reactNativeVersion() {
      try {
        const ver = ReactNative.Platform.constants.reactNativeVersion;
        return `${ver.major || 0}.${ver.minor || 0}.${ver.patch || 0}`;
      } catch (ex) {
        return "unknown";
      }
    },

    get hermesVersion() {
      try {
        if (window.HermesInternal === void 0) return "N/A";
        const runtimeProps = window.HermesInternal.getRuntimeProperties();
        return `${runtimeProps["OSS Release Version"]} ${runtimeProps["Build"]} (v${runtimeProps["Bytecode Version"]})`;
      } catch (ex) {
        return "unknown";
      }
    }

  };

  function makeAsyncEval(code) {
    return `
    var __async = (generator) => {
        return new Promise((resolve, reject) => {
            var fulfilled = (value) => {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            };

            var rejected = (value) => {
                try {
                    step(generator.throw(value));
                } catch (e) {
                    reject(e);
                }
            };

            var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

            step((generator = generator()).next());
        });
    };

    __async(function*() {
        ${code.replace(/\bawait\b/g, "yield")}
    });
    `;
  }

  var __async$3 = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = value => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };

      var rejected = value => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };

      var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  let CoreCommands = /*#__PURE__*/function (_Plugin) {
    _inherits(CoreCommands, _Plugin);

    var _super = _createSuper(CoreCommands);

    function CoreCommands() {
      _classCallCheck(this, CoreCommands);

      return _super.apply(this, arguments);
    }

    _createClass(CoreCommands, [{
      key: "start",
      value: function start() {
        const ClydeUtils = getByProps("sendBotMessage");
        this.commands.registerCommand({
          name: "echo",
          description: "Creates Clyde message",
          options: [{
            name: "message",
            description: i18n.Messages.COMMAND_SHRUG_MESSAGE_DESCRIPTION,
            required: true,
            type: ApplicationCommandOptionType.STRING
          }],
          execute: (args2, ctx2) => {
            ClydeUtils.sendBotMessage(ctx2.channel.id, args2[0].value);
          }
        });
        this.commands.registerCommand({
          name: "eval",
          description: "Eval javascript",
          options: [{
            name: "code",
            description: "Code to eval. Async functions are not supported. Await is, however you must specify a return explicitly",
            required: true,
            type: ApplicationCommandOptionType.STRING
          }],
          execute: (args, ctx) => __async$3(this, null, function* () {
            var _a, _b;

            try {
              const code = args[0].value;
              let result;

              if (code.includes("await")) {
                result = yield eval(makeAsyncEval(code));
              } else {
                result = eval(code);
              }

              ClydeUtils.sendBotMessage(ctx.channel.id, this.codeblock(String(result)));
            } catch (err) {
              ClydeUtils.sendBotMessage(ctx.channel.id, this.codeblock((_b = (_a = err == null ? void 0 : err.stack) != null ? _a : err == null ? void 0 : err.message) != null ? _b : String(err)));
            }
          })
        });
        this.commands.registerCommand({
          name: "debug",
          description: "Posts debug info",
          options: [],
          execute: (args2, ctx2) => __async$3(this, null, function* () {
            MessageActions.sendMessage(ctx2.channel.id, {
              content: `**Debug Info:**
                        > Discord: ${DebugInfo.discordVersion}
                        > Aliucord: ${sha}
                        > System: ${DebugInfo.system}
                        > React: ${DebugInfo.reactNativeVersion}
                        > Hermes: ${DebugInfo.hermesVersion}
                    `.replace(/^\s+/gm, "")
            });
          })
        });
      }
    }, {
      key: "codeblock",
      value: function codeblock(code2) {
        const ZWSP = "\u200B";
        return "```js\n" + code2.replace(/`/g, "`" + ZWSP) + "```";
      }
    }]);

    return CoreCommands;
  }(Plugin);

  let NoTrack = /*#__PURE__*/function (_Plugin) {
    _inherits(NoTrack, _Plugin);

    var _super = _createSuper(NoTrack);

    function NoTrack() {
      _classCallCheck(this, NoTrack);

      return _super.apply(this, arguments);
    }

    _createClass(NoTrack, [{
      key: "start",
      value: function start() {
        const Analytics = getByProps("getSuperPropertiesBase64", "track");
        const Snitch = getByProps("submitLiveCrashReport");
        const {
          AnalyticsActionHandlers
        } = getByProps("AnalyticsActionHandlers");
        insteadDoNothing(Analytics, "track");
        insteadDoNothing(Snitch, "submitLiveCrashReport");
        insteadDoNothing(AnalyticsActionHandlers, "handleTrack");
        const sentry = window.__SENTRY__;
        const hub = sentry.hub;
        sentry.logger.disable();
        insteadDoNothing(hub, "addBreadcrumb");
        hub.getClient().close(0);
        hub.getScope().clear();
        const c = console;

        for (const method in c) if (c[method].__sentry_original__) {
          c[method] = c[method].__sentry_original__;
        }
      }
    }]);

    return NoTrack;
  }(Plugin);

  const plugins$1 = [CommandHandler, CoreCommands, NoTrack];
  function startAll() {
    for (const pluginClass of plugins$1) {
      const {
        name
      } = pluginClass;

      try {
        window.Aliucord.logger.info("Loading CorePlugin " + name);
        new pluginClass().start();
      } catch (e) {
        window.Aliucord.logger.error("Failed to start CorePlugin " + name, e);
      }
    }
  }

  var __async$2 = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = value => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };

      var rejected = value => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };

      var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  const AliucordNative = window.nativeModuleProxy.AliucordNative;
  function mkdir(path, recursive = false) {
    return __async$2(this, null, function* () {
      try {
        return AliucordNative.mkdir(path, recursive);
      } catch (err) {
        return false;
      }
    });
  }
  const existsFile = AliucordNative.existsFile;
  const deleteFile = AliucordNative.deleteFile;
  function readFile(path, encoding = "utf-8") {
    return __async$2(this, null, function* () {
      return AliucordNative.readFile(path, encoding);
    });
  }
  function writeFile(path, content, encoding = "utf-8") {
    return __async$2(this, null, function* () {
      return AliucordNative.writeFile(path, content, encoding);
    });
  }
  function getManifest(plugin) {
    return __async$2(this, null, function* () {
      try {
        const data = yield AliucordNative.getManifest(plugin);
        return JSON.parse(data);
      } catch (err) {
        return null;
      }
    });
  }
  const listNativeModules = AliucordNative.listNativeModules;
  const checkPermissions = AliucordNative.checkPermissions;
  const requestPermissions = AliucordNative.requestPermissions;

  var index$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    mkdir: mkdir,
    existsFile: existsFile,
    deleteFile: deleteFile,
    readFile: readFile,
    writeFile: writeFile,
    getManifest: getManifest,
    listNativeModules: listNativeModules,
    checkPermissions: checkPermissions,
    requestPermissions: requestPermissions
  });

  const ALIUCORD_INVITE = "https://discord.gg/EsNDvBaHVU";
  const ALIUCORD_GITHUB = "https://github.com/Aliucord/Aliucord";
  const ALIUCORD_PATREON = "https://patreon.com/Aliucord";

  var constants = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ALIUCORD_INVITE: ALIUCORD_INVITE,
    ALIUCORD_GITHUB: ALIUCORD_GITHUB,
    ALIUCORD_PATREON: ALIUCORD_PATREON
  });

  var __async$1 = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = value => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };

      var rejected = value => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };

      var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

      step((generator = generator.apply(__this, __arguments)).next());
    });
  };
  let ws;
  function startDebugWs() {
    if (ws) return;
    ws = new WebSocket("ws://localhost:9090");
    const logger = new Logger("DebugWS");
    logger.info("Connecting to debug ws");
    ws.addEventListener("open", () => logger.info("Connected with debug websocket"));
    ws.addEventListener("error", e => logger.error(e.message));
    ws.addEventListener("message", message => __async$1(this, null, function* () {
      try {
        const {
          data
        } = message;

        if (data.includes("await")) {
          console.log(yield eval(makeAsyncEval(data)));
        } else {
          console.log(eval(data));
        }
      } catch (e) {
        logger.error(e);
      }
    }));
    before(globalThis, "nativeLoggingHook", (_, message2, level) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          level,
          message: message2
        }));
      }
    });
  }

  const assetMap = {};
  const AssetRegistry = getByProps("registerAsset");
  after(AssetRegistry, "registerAsset", (_, id, asset) => {
    assetMap[asset.name] = id;
  });

  for (let i = 1;; i++) {
    const asset = AssetRegistry.getAssetByID(i);

    if (asset) {
      assetMap[asset.name] = i;
    } else break;
  }

  function getAssetId(assetName) {
    return assetMap[assetName];
  }
  function findAssets(keyword) {
    keyword = keyword.toLowerCase();
    const names = [];

    for (const name in assetMap) {
      if (name.toLowerCase().includes(keyword)) {
        names.push(name);
      }
    }

    return names;
  }

  const {
    FormSection,
    FormSwitch,
    FormRow
  } = Forms;
  function AliucordPage() {
    const settings = useSettings(window.Aliucord.settings);
    return /* @__PURE__ */React.createElement(React.Fragment, null, /* @__PURE__ */React.createElement(FormSection, {
      title: "Settings",
      android_noDivider: true
    }, /* @__PURE__ */React.createElement(FormRow, {
      label: "Automatically disable plugins on crash",
      trailing: /* @__PURE__ */React.createElement(FormSwitch, {
        value: settings.get("disablePluginsOnCrash", true),
        onValueChange: v => settings.set("disablePluginsOnCrash", v)
      })
    }), /* @__PURE__ */React.createElement(FormRow, {
      label: "Automatically update Aliucord",
      trailing: /* @__PURE__ */React.createElement(FormSwitch, {
        value: settings.get("autoUpdateAliucord", false),
        onValueChange: v => settings.set("autoUpdateAliucord", v)
      })
    }), /* @__PURE__ */React.createElement(FormRow, {
      label: "Automatically update Plugins",
      trailing: /* @__PURE__ */React.createElement(FormSwitch, {
        value: settings.get("autoUpdatePlugins", false),
        onValueChange: v => settings.set("autoUpdatePlugins", v)
      })
    }), /* @__PURE__ */React.createElement(FormRow, {
      label: "Enable Debug WebSocket",
      trailing: /* @__PURE__ */React.createElement(FormSwitch, {
        value: settings.get("debugWS", false),
        onValueChange: v => {
          settings.set("debugWS", v);
          if (v) startDebugWs();
        }
      })
    })), /* @__PURE__ */React.createElement(FormSection, {
      title: "Socials"
    }, /* @__PURE__ */React.createElement(FormRow, {
      label: "Source Code",
      leading: /* @__PURE__ */React.createElement(FormRow.Icon, {
        source: getAssetId("img_account_sync_github_white")
      }),
      trailing: FormRow.Arrow,
      onPress: () => URLOpener.openURL(ALIUCORD_GITHUB)
    }), /* @__PURE__ */React.createElement(FormRow, {
      label: "Support Server",
      leading: /* @__PURE__ */React.createElement(FormRow.Icon, {
        source: getAssetId("img_help_icon")
      }),
      trailing: FormRow.Arrow,
      onPress: () => URLOpener.openURL(ALIUCORD_INVITE)
    }), /* @__PURE__ */React.createElement(FormRow, {
      label: "Support Us",
      leading: /* @__PURE__ */React.createElement(FormRow.Icon, {
        source: getAssetId("ic_premium_perk_heart_24px")
      }),
      trailing: FormRow.Arrow,
      onPress: () => URLOpener.openURL(ALIUCORD_PATREON)
    })));
  }

  const logger$1 = new Logger("PluginManager");
  let PluginManager = /*#__PURE__*/function () {
    function PluginManager() {
      _classCallCheck(this, PluginManager);
    }

    _createClass(PluginManager, null, [{
      key: "isEnabled",
      value: function isEnabled(plugin) {
        return window.Aliucord.settings.get("plugins", {})[plugin] === true;
      }
    }, {
      key: "enable",
      value: function enable(plugin) {
        const plugins = window.Aliucord.settings.get("plugins", {});
        plugins[plugin] = true;
        window.Aliucord.settings.set("plugins", plugins);
      }
    }, {
      key: "disable",
      value: function disable(plugin) {
        const plugins = window.Aliucord.settings.get("plugins", {});
        plugins[plugin] = false;
        window.Aliucord.settings.set("plugins", plugins);
      }
    }, {
      key: "_register",
      value: function _register(plugin) {
        const {
          name
        } = plugin;
        if (name in this.plugins) throw new Error(`Plugin ${name} already registered`);

        try {
          logger$1.info(`Loading Plugin ${name}...`);
          Settings.make(name).then(settings => {
            const inst = this.plugins[name] = new plugin(settings);
            inst.start();
          });
        } catch (err) {
          logger$1.error(`Failed to load Plugin ${name}
`, err);
        }
      }
    }]);

    return PluginManager;
  }();
  PluginManager.plugins = {};

  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;

  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
    enumerable: true,
    configurable: true,
    writable: true,
    value
  }) : obj[key] = value;

  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);

    if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    }
    return a;
  };
  const {
    View,
    Text,
    FlatList
  } = ReactNative;
  const plugins = [{
    name: "Test",
    description: "Test Plugin",
    version: "1.0.0",
    authors: [{
      username: "Pot of Avarice",
      id: "950095902922661988"
    }, {
      username: "Discord",
      id: "643945264868098049"
    }]
  }];

  for (let i = 1; i < 5; i++) {
    const copy = __spreadValues({}, plugins[i - 1]);

    copy.name += "a";
    copy.description += copy.description;
    plugins[i] = copy;
  }

  const styles = Styles.createThemedStyleSheet({
    list: {
      padding: 10
    },
    card: {
      borderRadius: 5,
      margin: 10,
      backgroundColor: Styles.ThemeColorMap.BACKGROUND_TERTIARY
    },
    header: {
      flexDirection: "row"
    },
    bodyCard: {
      backgroundColor: Styles.ThemeColorMap.BACKGROUND_SECONDARY
    },
    bodyText: {
      color: Styles.ThemeColorMap.TEXT_NORMAL,
      padding: 16
    },
    text: {
      fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
      color: Styles.ThemeColorMap.TEXT_NORMAL,
      fontSize: 16,
      lineHeight: 22
    },
    link: {
      marginLeft: 5,
      fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
      fontSize: 16,
      lineHeight: 22,
      color: Styles.ThemeColorMap.TEXT_LINK
    }
  });

  function PluginCard({
    plugin
  }) {
    const [isEnabled, setIsEnabled] = React.useState(PluginManager.isEnabled(plugin.name));
    return /* @__PURE__ */React.createElement(View, {
      style: styles.card
    }, /* @__PURE__ */React.createElement(Forms.FormRow, {
      label: /* @__PURE__ */React.createElement(View, {
        style: styles.header
      }, /* @__PURE__ */React.createElement(Text, {
        style: styles.text
      }, plugin.name, " v", plugin.version, " by"), plugin.authors.map((a, i) => /* @__PURE__ */React.createElement(Text, {
        key: a.id,
        style: styles.link,
        onPress: () => getByProps("showUserProfile").showUserProfile({
          userId: a.id
        })
      }, a.username, i !== plugin.authors.length - 1 && ","))),
      trailing: /* @__PURE__ */React.createElement(Forms.FormSwitch, {
        value: isEnabled,
        onValueChange: v => {
          if (v) PluginManager.enable(plugin.name);else PluginManager.disable(plugin.name);
          setIsEnabled(v);
        }
      })
    }), /* @__PURE__ */React.createElement(View, {
      style: styles.bodyCard
    }, /* @__PURE__ */React.createElement(Forms.FormText, {
      style: styles.bodyText
    }, plugin.description)), /* @__PURE__ */React.createElement(View, {
      style: {
        flexDirection: "row",
        alignContent: "space-between"
      }
    }, /* @__PURE__ */React.createElement(Forms.FormRow.Icon, {
      source: getAssetId("img_account_sync_github_white")
    }), /* @__PURE__ */React.createElement(View, null, /* @__PURE__ */React.createElement(Forms.FormRow.Icon, {
      source: getAssetId("")
    }))));
  }

  function PluginsPage() {
    return /* @__PURE__ */React.createElement(FlatList, {
      data: plugins,
      renderItem: ({
        item
      }) => /* @__PURE__ */React.createElement(PluginCard, {
        key: item.name,
        plugin: item
      }),
      keyExtractor: plugin => plugin.name,
      style: styles.list
    });
  }

  function UpdaterPage() {
    return null;
  }

  function patchSettings() {
    const {
      FormSection,
      FormRow
    } = Forms;
    const UserSettingsOverviewWrapper = getModule(m => {
      var _a;

      return ((_a = m.default) == null ? void 0 : _a.name) === "UserSettingsOverviewWrapper";
    });
    after(getModule(m => {
      var _a;

      return ((_a = m.default) == null ? void 0 : _a.name) === "getScreens";
    }), "default", (_, res) => {
      res.ASettings = {
        title: "Aliucord",
        render: AliucordPage
      };
      res.APlugins = {
        title: "Plugins",
        render: PluginsPage
      };
      res.AThemes = {
        title: "Themes",
        render: () => /* @__PURE__ */React.createElement(ReactNative.Text, null, "Hello World")
      };
      res.AUpdater = {
        title: "Updater",
        render: UpdaterPage
      };
    });
    const unpatch = after(UserSettingsOverviewWrapper, "default", (_, res) => {
      unpatch();
      const {
        navigation
      } = res.props;
      after(res.type.prototype, "renderSupportAndAcknowledgements", (_2, {
        props
      }) => {
        const idx = props.children.findIndex(c => {
          var _a;

          return ((_a = c == null ? void 0 : c.type) == null ? void 0 : _a.name) === "UploadLogsButton";
        });

        if (idx !== -1) {
          props.children.splice(idx, 1);
        }
      });
      after(res.type.prototype, "render", (_2, {
        props
      }) => {
        const nitroIndex = props.children.findIndex(c => {
          var _a;

          return ((_a = c == null ? void 0 : c.props) == null ? void 0 : _a.title) === i18n.Messages.PREMIUM_SETTINGS;
        });
        const aliucordSection = /* @__PURE__ */React.createElement(FormSection, {
          key: "AliucordSection",
          title: `Aliucord (${sha})`
        }, /* @__PURE__ */React.createElement(FormRow, {
          label: "Aliucord",
          trailing: FormRow.Arrow,
          onPress: () => navigation.push("ASettings")
        }), /* @__PURE__ */React.createElement(FormRow, {
          label: "Plugins",
          trailing: FormRow.Arrow,
          onPress: () => navigation.push("APlugins")
        }), /* @__PURE__ */React.createElement(FormRow, {
          label: "Themes",
          trailing: FormRow.Arrow,
          onPress: () => navigation.push("AThemes")
        }), /* @__PURE__ */React.createElement(FormRow, {
          label: "Updater",
          trailing: FormRow.Arrow,
          onPress: () => navigation.push("AUpdater")
        }));
        props.children.splice(nitroIndex, 0, aliucordSection);
      });
    });
  }

  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = value => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };

      var rejected = value => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };

      var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  function initWithPerms() {}

  let settings;
  const logger = new Logger("AliucordMain");
  function load() {
    return __async(this, null, function* () {
      settings = yield Settings.make("Aliucord");

      try {
        logger.info("Loading...");
        checkPermissions().then(granted => {
          if (granted) initWithPerms();else {
            ReactNative.Alert.alert("Storage Access", "Aliucord needs access to your storage to load plugins and themes.", [{
              text: "OK",
              onPress: () => requestPermissions().then(permissionGranted => {
                if (permissionGranted) initWithPerms();else alert("Aliucord needs access to your storage to load plugins and themes.");
              })
            }]);
          }
        });
        startAll();

        if (settings.get("debugWS", false)) {
          startDebugWs();
        }

        if (false) ;

        patchSettings();
      } catch (error) {
        logger.error(error);
      }
    });
  }

  var Aliucord = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get settings () { return settings; },
    logger: logger,
    load: load
  });

  var index$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ApplicationCommandInputType: ApplicationCommandInputType,
    ApplicationCommandOptionType: ApplicationCommandOptionType,
    ApplicationCommandType: ApplicationCommandType,
    Commands: Commands,
    Patcher: Patcher,
    PluginManager: PluginManager,
    useSettings: useSettings,
    Settings: Settings
  });

  var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Plugin: Plugin
  });

  const {
    hasOwnProperty
  } = Object.prototype;
  function findInReactTree(tree, searchFilter) {
    return findInTree(tree, searchFilter, {
      walkable: ["props", "children", "child", "sibling"]
    });
  }
  function findInTree(tree, searchFilter, {
    walkable = void 0,
    ignore = []
  } = {}) {
    if (typeof searchFilter === "string") {
      if (hasOwnProperty.call(tree, searchFilter)) return tree[searchFilter];
    } else if (searchFilter(tree)) {
      return tree;
    }

    if (typeof tree !== "object" || tree == null) return void 0;
    let tempReturn;

    if (Array.isArray(tree)) {
      for (const value of tree) {
        tempReturn = findInTree(value, searchFilter, {
          walkable,
          ignore
        });
        if (typeof tempReturn != "undefined") return tempReturn;
      }
    } else {
      const toWalk = walkable == null ? Object.keys(tree) : walkable;

      for (const key of toWalk) {
        if (!hasOwnProperty.call(tree, key) || ignore.includes(key)) continue;
        tempReturn = findInTree(tree[key], searchFilter, {
          walkable,
          ignore
        });
        if (typeof tempReturn != "undefined") return tempReturn;
      }
    }

    return tempReturn;
  }

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Constants: constants,
    Patcher: patcher,
    DebugInfo: DebugInfo,
    findInReactTree: findInReactTree,
    findInTree: findInTree,
    getAssetId: getAssetId,
    findAssets: findAssets,
    makeAsyncEval: makeAsyncEval
  });

  window.Aliucord = Aliucord;
  load();

  exports.api = index$2;
  exports.entities = index$1;
  exports.metro = index$4;
  exports.native = index$3;
  exports.utils = index;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=Aliucord.js.map
