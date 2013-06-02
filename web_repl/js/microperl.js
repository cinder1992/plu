// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    HEAPU8.set(new Uint8Array(slab), ret);
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math.imul) Math.imul = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 6000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 93392;
var _stdout;
var _stdin;
var _stderr;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,32,98,117,116,32,116,114,117,101,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,88,2,2,15,17,19,2,99,98,18,14,77,13,2,2,2,2,2,2,2,2,2,2,2,2,80,20,2,2,2,79,16,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,11,2,12,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,9,2,10,89,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,3,4,5,6,7,8,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,78,81,82,83,84,85,86,87,90,91,92,93,94,95,96,97,100,0,0,0,0,0,0,0,57,0,131,0,118,0,185,0,231,0,220,0,14,0,104,0,102,0,150,0,94,0,100,1,75,0,93,0,93,0,164,0,169,1,191,0,196,0,197,0,198,0,199,0,201,0,203,0,204,0,74,0,110,0,110,0,110,0,110,0,110,0,238,0,110,0,110,0,142,0,13,1,141,0,14,1,19,0,20,0,21,0,19,0,19,0,128,0,219,0,150,1,137,0,157,0,15,1,133,0,110,0,139,0,53,1,192,1,164,0,146,0,112,0,113,0,114,0,115,0,161,0,116,0,117,0,119,0,127,1,102,1,70,1,195,0,107,1,88,1,162,0,234,0,163,0,120,0,235,0,131,0,206,0,222,0,134,0,135,0,89,1,52,1,186,0,125,0,187,0,140,1,182,1,165,0,164,0,186,0,87,1,187,0,205,0,233,0,202,0,200,0,217,0,126,0,51,1,93,0,164,0,131,0,108,1,93,0,93,0,158,0,159,0,160,0,81,1,127,0,223,0,237,0,83,1,158,0,159,0,160,0,161,0,230,0,57,0,74,0,190,0,93,1,144,0,96,1,225,0,16,1,165,0,158,0,159,0,160,0,144,1,116,1,137,1,138,1,133,0,240,0,188,0,39,1,189,0,33,1,34,1,35,1,36,1,37,1,38,1,194,0,40,1,41,1,207,0,245,0,246,0,247,0,209,0,249,0,250,0,100,1,121,1,253,0,221,0,141,1,165,0,154,1,224,0,232,0,158,0,159,0,160,0,166,1,167,1,158,0,159,0,160,0,165,0,158,0,159,0,160,0,20,1,21,1,22,1,23,1,24,1,25,1,226,0,228,0,26,1,158,0,159,0,160,0,158,0,159,0,160,0,18,1,158,0,159,0,160,0,236,0,241,0,243,0,27,1,110,1,69,1,44,1,46,1,47,1,48,1,49,1,50,1,185,1,78,1,43,1,244,0,123,1,57,0,105,0,106,0,29,1,31,1,158,0,159,0,160,0,158,0,159,0,160,0,59,1,80,1,61,1,63,1,55,1,121,0,74,0,66,1,58,1,124,0,64,1,67,1,19,0,68,1,129,0,105,1,82,1,138,0,107,0,160,0,143,0,71,1,149,0,108,0,151,0,152,0,153,0,154,0,155,0,90,1,158,0,159,0,160,0,19,0,109,1,84,1,111,1,74,1,75,1,118,1,77,1,210,0,211,0,212,0,213,0,124,1,131,0,125,1,214,0,126,1,215,0,148,1,129,1,130,1,158,0,159,0,160,0,92,1,46,1,95,1,46,1,93,0,104,1,86,1,128,1,95,1,134,1,131,1,132,1,158,0,159,0,160,0,120,1,133,1,158,0,159,0,160,0,99,1,158,0,159,0,160,0,153,1,61,255,155,1,170,0,171,0,171,1,159,1,158,0,159,0,160,0,112,1,117,1,135,1,176,1,177,1,136,1,163,1,164,1,188,255,142,1,139,1,57,0,57,1,183,1,173,1,174,1,61,255,61,255,179,0,180,0,184,0,186,1,151,1,179,1,181,0,182,0,183,0,181,1,143,1,184,0,131,0,157,1,158,1,170,1,158,0,159,0,160,0,162,1,95,1,95,1,158,0,159,0,160,0,248,0,180,1,190,1,191,1,170,0,171,0,254,0,255,0,0,1,1,1,2,1,3,1,4,1,5,1,6,1,7,1,8,1,9,1,10,1,11,1,12,1,172,1,65,1,188,1,95,1,189,1,92,1,98,0,145,1,179,0,180,0,168,0,61,255,170,0,171,0,181,0,182,0,183,0,216,0,161,1,184,0,145,1,187,1,156,1,123,0,147,0,158,0,159,0,160,0,158,0,159,0,160,0,158,0,159,0,160,0,148,0,42,1,178,1,179,0,180,0,160,1,0,0,93,0,0,0,181,0,182,0,183,0,243,255,76,0,184,0,95,1,72,1,0,0,0,0,79,1,0,0,74,0,113,1,16,0,93,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,77,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,78,0,97,0,79,0,80,0,35,0,81,0,82,0,83,0,84,0,85,0,86,0,0,0,0,0,170,0,87,0,88,0,89,0,90,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,158,0,159,0,160,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,91,0,49,0,0,0,180,0,0,0,0,0,0,0,50,0,181,0,182,0,183,0,0,0,0,0,184,0,0,0,114,1,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,253,255,76,0,54,0,55,0,0,0,0,0,56,0,92,0,119,1,74,0,0,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,77,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,78,0,97,0,79,0,80,0,35,0,81,0,82,0,83,0,84,0,85,0,86,0,0,0,0,0,0,0,87,0,88,0,89,0,90,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,158,0,159,0,160,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,91,0,49,0,0,0,158,0,159,0,160,0,180,0,50,0,0,0,0,0,0,0,181,0,182,0,183,0,0,0,115,1,184,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,76,0,0,0,54,0,55,0,122,1,0,0,56,0,92,0,74,0,85,1,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,77,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,78,0,97,0,79,0,80,0,35,0,81,0,82,0,83,0,84,0,85,0,86,0,0,0,0,0,0,0,87,0,88,0,89,0,90,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,91,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,1,0,2,0,3,0,4,0,5,0,6,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,76,0,0,0,54,0,55,0,0,0,0,0,56,0,92,0,74,0,175,1,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,77,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,78,0,97,0,79,0,80,0,35,0,81,0,82,0,83,0,84,0,85,0,86,0,0,0,0,0,0,0,87,0,88,0,89,0,90,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,91,0,49,0,0,0,181,0,182,0,183,0,0,0,50,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,76,0,0,0,54,0,55,0,0,0,0,0,56,0,92,0,74,0,184,1,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,77,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,78,0,97,0,79,0,80,0,35,0,81,0,82,0,83,0,84,0,85,0,86,0,0,0,0,0,0,0,87,0,88,0,89,0,90,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,91,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,76,0,0,0,54,0,55,0,0,0,0,0,56,0,92,0,74,0,0,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,77,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,78,0,97,0,79,0,80,0,35,0,81,0,82,0,83,0,84,0,85,0,86,0,0,0,0,0,0,0,87,0,88,0,89,0,90,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,91,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,76,0,0,0,54,0,55,0,0,0,0,0,56,0,92,0,74,0,0,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,77,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,78,0,0,0,79,0,80,0,35,0,81,0,82,0,83,0,84,0,85,0,86,0,0,0,0,0,0,0,87,0,88,0,89,0,90,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,91,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,76,0,0,0,0,0,0,0,54,0,55,0,170,0,171,0,56,0,92,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,193,255,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,180,0,0,0,0,0,0,0,35,0,181,0,182,0,183,0,0,0,0,0,184,0,0,0,0,0,0,0,168,0,169,0,170,0,171,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,176,0,177,0,178,0,179,0,180,0,50,0,0,0,0,0,0,0,181,0,182,0,183,0,0,0,0,0,184,0,0,0,0,0,51,0,52,0,53,0,76,0,0,0,0,0,0,0,54,0,55,0,0,0,0,0,56,0,0,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,93,255,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,186,0,49,0,187,0,93,255,0,0,0,0,0,0,50,0,0,0,0,0,0,0,93,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,193,255,56,0,93,255,93,255,93,255,93,255,0,0,0,0,0,0,93,255,0,0,93,255,0,0,0,0,93,255,0,0,0,0,0,0,0,0,0,0,0,0,93,255,93,255,93,255,93,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,255,93,255,93,255,62,255,93,255,93,255,93,255,93,255,93,255,93,255,93,255,93,255,93,255,93,255,93,255,62,255,0,0,0,0,0,0,93,255,93,255,93,255,0,0,62,255,93,255,93,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,0,169,0,170,0,171,0,0,0,0,0,0,0,0,0,0,0,0,0,62,255,62,255,62,255,62,255,0,0,0,0,0,0,62,255,0,0,62,255,0,0,0,0,62,255,0,0,0,0,177,0,178,0,179,0,180,0,62,255,62,255,62,255,62,255,181,0,182,0,183,0,0,0,0,0,184,0,0,0,0,0,0,0,0,0,62,255,62,255,62,255,0,0,62,255,62,255,62,255,62,255,62,255,62,255,62,255,62,255,62,255,62,255,62,255,0,0,0,0,0,0,0,0,62,255,62,255,62,255,0,0,0,0,62,255,62,255,74,0,0,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,130,0,25,0,26,0,27,0,28,0,108,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,0,169,0,170,0,171,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,178,0,179,0,180,0,0,0,0,0,50,0,0,0,181,0,182,0,183,0,0,0,0,0,184,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,74,0,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,168,0,169,0,170,0,171,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,179,0,180,0,0,0,0,0,0,0,50,0,181,0,182,0,183,0,0,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,74,0,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,136,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,210,0,211,0,212,0,213,0,0,0,0,0,0,0,214,0,0,0,215,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,158,0,159,0,160,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,0,0,56,0,16,0,103,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,16,0,56,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,140,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,16,0,56,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,156,0,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,229,0,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,239,0,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,252,0,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,19,1,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,60,1,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,62,1,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,76,1,56,0,16,0,0,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,0,0,24,0,25,0,26,0,27,0,28,0,0,0,29,0,30,0,31,0,32,0,33,0,34,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,37,0,38,0,39,0,40,0,41,0,42,0,0,0,0,0,0,0,0,0,43,0,44,0,45,0,46,0,47,0,48,0,0,0,49,0,0,0,0,0,0,0,167,0,0,0,50,0,0,0,0,0,0,0,0,0,168,0,169,0,170,0,171,0,0,0,0,0,0,0,51,0,52,0,53,0,0,0,0,0,0,0,0,0,54,0,55,0,0,0,0,0,56,0,172,0,173,0,73,1,174,0,175,0,176,0,177,0,178,0,179,0,180,0,0,0,0,0,0,0,167,0,181,0,182,0,183,0,0,0,0,0,184,0,168,0,169,0,170,0,171,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,172,0,173,0,0,0,174,0,175,0,176,0,177,0,178,0,179,0,180,0,0,0,0,0,0,0,167,0,181,0,182,0,183,0,0,0,0,0,184,0,168,0,169,0,170,0,171,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,173,0,0,0,174,0,175,0,176,0,177,0,178,0,179,0,180,0,0,0,0,0,0,0,61,255,181,0,182,0,183,0,0,0,0,0,184,0,168,0,169,0,170,0,171,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,174,0,175,0,176,0,177,0,178,0,179,0,180,0,0,0,0,0,0,0,0,0,181,0,182,0,183,0,0,0,0,0,184,0,0,0,0,0,0,0,0,3,4,5,6,7,8,102,103,104,105,106,107,108,0,110,11,13,14,15,16,17,18,19,21,22,23,24,25,27,28,29,30,31,32,37,51,53,54,55,56,57,58,63,64,65,66,67,68,70,76,88,89,90,95,96,99,139,140,141,144,145,146,147,148,149,150,153,157,158,159,160,161,162,9,109,1,20,33,35,36,38,39,40,41,42,43,47,48,49,50,69,100,109,117,120,139,34,115,116,117,114,114,12,139,149,149,21,26,109,158,163,163,163,163,163,163,163,99,11,99,149,132,132,149,99,99,99,109,149,21,140,152,158,163,163,21,109,149,158,20,139,21,149,99,151,158,159,160,149,140,149,149,149,149,149,98,139,73,74,75,77,9,11,27,99,154,52,59,60,61,62,78,79,81,82,83,84,85,86,87,92,93,94,97,154,9,11,9,11,9,110,133,131,21,131,154,154,154,154,68,154,158,154,154,109,131,46,122,20,40,41,42,43,47,49,116,117,115,12,152,99,140,139,98,109,24,135,98,98,139,153,163,140,154,154,10,20,152,98,139,71,137,11,98,139,139,139,149,139,139,155,98,139,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,9,11,22,99,143,158,98,139,139,139,139,139,139,114,21,130,21,134,21,118,110,110,110,110,110,110,154,110,110,134,109,139,126,139,139,139,139,139,153,98,12,142,71,136,98,98,139,98,139,98,139,10,98,24,139,11,20,12,99,98,80,139,139,98,139,154,98,20,12,20,12,20,10,109,135,9,20,21,125,139,126,127,139,126,129,156,158,120,124,127,128,139,110,111,127,135,98,152,24,109,98,98,98,12,139,10,149,20,12,98,153,10,10,10,136,110,21,98,98,98,98,154,98,20,127,127,98,136,12,10,98,20,109,138,119,152,123,123,9,112,112,127,112,125,98,98,112,138,114,20,112,112,113,44,45,121,121,98,122,20,112,112,10,122,122,114,112,154,112,123,122,10,127,122,128,98,98,112,112,121,0,0,0,0,0,0,0,0,2,0,4,0,3,0,3,0,3,0,3,0,3,4,0,0,4,0,0,2,1,1,2,2,1,1,4,6,6,4,0,7,7,7,7,6,2,8,8,11,9,8,7,2,0,8,2,1,1,1,3,3,3,3,3,3,0,2,6,0,2,0,0,1,0,1,1,1,1,1,1,0,0,0,0,1,0,1,0,2,1,2,1,1,1,3,3,3,1,2,3,1,3,5,6,3,3,5,2,4,0,5,1,1,5,4,5,4,5,6,5,4,5,4,3,6,4,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,3,2,4,3,5,2,2,4,5,4,5,1,1,1,1,5,2,1,2,3,1,2,1,1,1,1,1,1,4,5,1,1,3,4,3,1,2,2,1,2,2,1,2,1,2,1,3,1,3,1,3,4,4,1,1,1,1,3,2,3,2,1,1,1,0,1,0,1,1,0,3,1,2,2,2,2,2,2,1,1,1,1,0,0,101,103,102,104,102,105,102,106,102,107,102,108,102,109,110,111,112,113,114,114,115,115,116,116,117,117,117,117,117,117,118,117,117,117,117,117,117,117,117,117,117,117,117,117,119,117,117,117,120,120,120,120,120,120,120,120,121,121,121,122,122,123,124,124,125,125,126,127,128,129,130,130,131,132,133,134,135,135,136,136,136,137,137,138,138,139,139,139,139,140,140,140,141,141,141,141,141,141,141,141,142,141,143,143,144,144,144,144,144,144,144,144,144,144,144,144,144,144,145,145,145,145,145,145,145,145,145,145,145,145,145,145,146,146,146,146,146,146,146,146,147,147,147,147,147,148,148,148,148,148,148,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,149,150,150,151,151,151,151,151,152,152,153,153,154,155,154,156,157,158,159,160,161,162,163,163,163,163,0,118,254,118,254,118,254,118,254,118,254,118,254,118,254,118,254,2,0,199,255,118,254,171,255,118,254,249,255,116,1,42,1,255,255,118,254,118,254,229,254,119,254,154,255,170,254,118,254,8,0,87,255,27,255,217,255,118,254,118,254,241,255,110,1,118,254,207,0,60,255,233,254,118,254,21,0,247,255,215,255,118,254,118,254,118,254,118,254,118,254,118,254,118,254,118,254,196,0,118,254,118,254,145,255,133,255,191,255,118,254,118,254,118,254,7,0,98,1,108,1,118,254,118,254,36,0,0,0,171,2,118,254,118,254,118,254,118,254,118,254,118,254,6,0,118,254,232,9,16,0,209,3,117,3,118,254,118,254,118,254,114,6,232,9,232,9,220,0,220,0,220,0,220,0,220,0,118,254,220,0,220,0,118,254,159,255,52,0,230,255,118,254,232,9,118,254,118,254,118,254,232,9,118,254,240,255,254,255,10,0,192,5,103,5,220,0,25,6,201,6,13,0,232,9,23,0,232,9,232,9,232,9,232,9,232,9,232,9,232,9,32,7,115,0,39,0,118,254,61,0,118,254,118,254,118,254,118,254,37,10,118,254,118,254,244,255,80,0,127,0,118,254,118,254,111,0,118,254,118,254,118,254,118,254,118,254,118,254,118,254,124,0,118,254,244,255,244,255,244,255,244,255,27,0,244,255,244,255,16,0,118,254,118,254,102,0,118,254,132,0,23,6,117,3,118,254,118,254,118,254,168,1,5,2,118,254,32,0,169,2,169,2,118,254,118,254,118,254,118,254,118,254,118,254,118,254,118,254,118,254,232,9,59,0,232,9,232,9,64,0,44,1,16,0,158,0,37,10,85,0,121,7,103,5,118,254,44,1,13,5,39,0,118,254,193,4,232,9,118,254,244,255,118,254,44,1,73,0,185,0,91,0,232,9,44,1,210,7,125,0,118,254,118,254,118,254,44,1,39,0,169,2,169,2,169,2,237,0,237,0,186,0,112,0,232,9,232,9,232,9,232,9,232,9,232,9,118,254,118,254,43,8,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,232,9,118,254,118,254,26,0,132,8,232,9,232,9,232,9,232,9,232,9,118,254,177,0,194,0,195,0,118,254,118,254,118,254,118,254,118,254,118,254,118,254,244,255,118,254,118,254,118,254,194,0,16,0,118,254,118,254,232,9,232,9,232,9,232,9,232,9,232,9,118,254,118,254,118,254,118,254,118,254,232,9,239,255,40,0,118,254,118,254,118,254,156,0,118,254,118,254,228,0,133,0,232,9,39,0,221,8,54,9,118,254,223,0,118,254,118,254,25,1,206,0,118,254,232,9,225,0,167,0,167,0,118,254,37,10,180,0,54,0,145,0,118,254,74,1,115,10,246,0,73,1,249,1,153,1,37,10,254,9,31,4,31,4,240,4,89,5,177,5,245,3,169,2,169,2,232,9,232,9,118,254,143,9,244,255,118,254,118,254,77,1,204,0,96,0,219,0,100,0,238,0,97,2,118,254,16,0,118,254,158,0,60,0,231,0,232,9,232,9,232,9,232,9,241,0,43,4,118,254,118,254,232,9,158,0,118,254,115,0,118,254,115,0,115,0,115,0,115,0,115,0,159,0,118,254,118,254,232,9,235,0,16,0,118,254,118,254,80,1,118,254,154,1,118,254,247,1,118,254,118,254,118,254,119,0,232,9,252,0,118,254,118,254,118,254,232,9,19,1,144,0,118,254,4,2,232,9,118,254,2,1,118,254,4,1,118,254,6,1,118,254,118,254,156,0,118,254,118,254,254,0,178,0,115,0,192,0,193,0,115,0,118,254,198,0,244,255,118,254,118,254,118,254,218,0,43,1,224,0,232,9,232,9,226,0,156,0,118,254,118,254,118,254,118,254,118,254,118,254,118,254,118,254,147,0,118,254,76,10,57,1,118,254,118,254,244,0,118,254,118,254,118,254,110,0,118,254,232,9,118,254,118,254,71,1,71,1,232,9,71,1,232,9,247,0,248,0,71,1,110,0,118,254,118,254,118,254,118,254,118,254,118,254,118,254,75,1,71,1,71,1,118,254,123,0,123,0,249,0,102,0,102,1,71,1,71,1,118,254,118,254,189,2,118,254,102,0,102,0,118,254,71,1,244,255,118,254,118,254,71,1,118,254,118,254,102,0,118,254,118,254,118,254,118,254,25,3,118,254,232,9,102,0,133,4,118,254,118,254,26,1,118,254,28,1,71,1,71,1,123,0,118,254,118,254,0,0,0,0,0,0,255,255,7,0,8,0,9,0,10,0,11,0,12,0,13,0,109,0,15,0,106,1,152,1,165,1,101,0,218,0,99,0,100,0,32,1,147,1,95,0,168,1,208,0,149,1,101,1,91,1,45,1,94,1,103,1,97,1,28,1,193,0,122,0,192,0,30,1,227,0,56,1,242,0,146,1,96,0,58,0,59,0,54,1,17,1,60,0,61,0,62,0,63,0,64,0,65,0,66,0,145,0,132,0,67,0,166,0,251,0,98,1,68,0,69,0,70,0,71,0,72,0,73,0,111,0,0,0,0,2,4,6,8,10,12,0,15,207,0,0,0,19,1,19,0,0,0,0,0,0,0,0,194,0,0,171,0,161,188,190,184,74,197,74,176,196,186,0,0,179,205,0,0,0,0,0,0,182,0,0,0,0,0,0,0,208,89,195,168,152,153,154,155,92,158,5,172,163,166,165,167,164,15,7,49,48,25,75,73,0,73,0,0,0,0,0,0,0,0,73,26,60,9,0,50,0,11,22,21,0,0,142,0,133,134,219,222,221,220,214,215,216,218,213,205,0,0,0,0,185,0,77,177,0,0,207,180,181,219,206,99,220,0,217,194,147,146,163,0,0,205,159,0,199,202,204,203,183,178,135,136,157,140,139,162,0,0,0,0,90,0,0,210,209,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,137,0,0,0,0,0,0,0,19,72,0,0,31,15,15,15,15,15,15,0,15,15,37,0,0,44,47,0,0,0,0,0,0,24,23,20,141,97,207,0,0,189,101,78,79,187,191,0,0,0,93,0,0,144,0,175,201,0,83,198,0,160,88,87,86,91,0,0,0,115,0,128,124,125,121,122,119,0,131,130,129,127,126,123,132,120,0,0,103,0,96,104,173,0,0,0,0,0,0,0,71,0,76,77,0,0,65,0,0,0,0,0,15,16,0,77,61,53,54,67,51,52,55,56,0,193,117,205,81,0,192,100,0,148,0,150,0,143,200,82,0,0,0,108,211,114,0,0,0,112,0,207,174,0,106,0,169,0,14,27,79,15,30,0,0,66,0,0,68,70,0,0,212,64,69,0,0,50,0,0,0,79,98,102,80,145,94,149,151,118,0,111,156,0,107,113,0,109,170,105,0,45,205,62,62,0,0,0,0,65,0,0,0,0,116,110,95,85,84,28,19,0,0,0,18,57,57,0,60,0,0,0,36,29,0,32,60,60,19,0,0,33,34,0,43,62,60,35,46,38,39,0,58,0,60,0,42,17,0,41,0,0,0,57,40,59,0,0,0,0,0,0,0,9,0,42,0,99,0,68,0,127,0,116,0,0,0,16,0,15,0,50,0,11,0,38,1,10,0,11,0,12,0,27,0,153,1,74,0,83,0,84,0,85,0,86,0,87,0,88,0,89,0,9,0,19,0,20,0,21,0,22,0,23,0,142,0,25,0,26,0,21,0,9,0,45,0,11,0,15,0,16,0,17,0,15,0,15,0,41,0,12,0,131,1,44,0,56,0,22,0,42,0,43,0,44,0,12,0,190,1,27,0,48,0,20,0,21,0,22,0,23,0,77,0,25,0,26,0,11,0,87,1,38,1,12,0,82,0,41,1,9,0,9,0,136,0,11,0,99,0,139,0,116,0,91,0,118,0,42,0,43,0,20,0,98,0,9,0,99,0,11,0,108,1,172,1,99,0,27,0,9,0,30,1,11,0,90,0,134,0,87,0,68,0,97,0,99,0,221,0,97,0,27,0,142,0,42,1,101,0,102,0,73,0,74,0,75,0,12,0,99,0,119,0,20,0,12,0,73,0,74,0,75,0,77,0,126,0,127,0,9,0,9,0,34,1,99,0,36,1,122,0,99,0,99,0,73,0,74,0,75,0,20,0,12,0,105,1,106,1,127,0,144,0,9,0,202,0,11,0,196,0,197,0,198,0,199,0,200,0,201,0,21,0,203,0,204,0,46,0,158,0,159,0,160,0,20,0,162,0,163,0,182,1,12,0,166,0,99,0,12,0,99,0,134,1,98,0,127,0,73,0,74,0,75,0,44,0,45,0,73,0,74,0,75,0,99,0,73,0,74,0,75,0,185,0,186,0,187,0,188,0,189,0,190,0,24,0,98,0,191,0,73,0,74,0,75,0,73,0,74,0,75,0,184,0,73,0,74,0,75,0,10,0,71,0,11,0,21,0,54,1,20,0,210,0,211,0,212,0,213,0,214,0,215,0,180,1,17,1,207,0,98,0,78,1,221,0,17,0,18,0,21,0,21,0,73,0,74,0,75,0,73,0,74,0,75,0,232,0,20,0,234,0,235,0,71,0,32,0,9,0,24,0,98,0,36,0,10,0,243,0,15,0,11,0,41,0,39,1,20,0,44,0,21,0,75,0,47,0,99,0,49,0,26,0,51,0,52,0,53,0,54,0,55,0,21,0,73,0,74,0,75,0,15,0,98,0,20,0,24,0,13,1,14,1,10,0,16,1,40,0,41,0,42,0,43,0,10,0,54,1,10,0,47,0,10,0,49,0,129,1,21,0,98,0,73,0,74,0,75,0,33,1,34,1,35,1,36,1,26,1,38,1,28,1,88,1,41,1,98,1,98,0,98,0,73,0,74,0,75,0,20,0,98,0,73,0,74,0,75,0,37,1,73,0,74,0,75,0,133,1,59,0,135,1,61,0,62,0,155,1,139,1,73,0,74,0,75,0,56,1,68,1,98,0,163,1,164,1,20,0,149,1,150,1,98,0,10,0,98,0,78,1,98,0,173,1,157,1,158,1,93,0,94,0,86,0,87,0,97,0,181,1,9,0,166,1,92,0,93,0,94,0,170,1,98,0,97,0,129,1,98,0,98,0,98,0,73,0,74,0,75,0,20,0,105,1,106,1,73,0,74,0,75,0,161,0,167,1,188,1,189,1,61,0,62,0,167,0,168,0,169,0,170,0,171,0,172,0,173,0,174,0,175,0,176,0,177,0,178,0,179,0,180,0,181,0,20,0,98,0,98,0,134,1,98,0,136,1,12,0,127,1,86,0,87,0,59,0,60,0,61,0,62,0,92,0,93,0,94,0,97,0,147,1,97,0,140,1,182,1,136,1,35,0,48,0,73,0,74,0,75,0,73,0,74,0,75,0,73,0,74,0,75,0,48,0,206,0,165,1,86,0,87,0,140,1,255,255,161,1,255,255,92,0,93,0,94,0,0,0,1,0,97,0,180,1,98,0,255,255,255,255,98,0,255,255,9,0,98,0,11,0,178,1,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,33,0,34,0,35,0,36,0,37,0,38,0,39,0,40,0,41,0,42,0,43,0,255,255,255,255,61,0,47,0,48,0,49,0,50,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,73,0,74,0,75,0,255,255,63,0,64,0,65,0,66,0,67,0,68,0,69,0,70,0,255,255,87,0,255,255,255,255,255,255,76,0,92,0,93,0,94,0,255,255,255,255,97,0,255,255,98,0,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,0,0,1,0,95,0,96,0,255,255,255,255,99,0,100,0,73,1,9,0,255,255,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,33,0,34,0,35,0,36,0,37,0,38,0,39,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,48,0,49,0,50,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,73,0,74,0,75,0,255,255,63,0,64,0,65,0,66,0,67,0,68,0,69,0,70,0,255,255,73,0,74,0,75,0,87,0,76,0,255,255,255,255,255,255,92,0,93,0,94,0,255,255,98,0,97,0,255,255,255,255,88,0,89,0,90,0,255,255,255,255,1,0,255,255,95,0,96,0,98,0,255,255,99,0,100,0,9,0,10,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,33,0,34,0,35,0,36,0,37,0,38,0,39,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,48,0,49,0,50,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,69,0,70,0,255,255,255,255,255,255,255,255,255,255,76,0,3,0,4,0,5,0,6,0,7,0,8,0,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,1,0,255,255,95,0,96,0,255,255,255,255,99,0,100,0,9,0,10,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,33,0,34,0,35,0,36,0,37,0,38,0,39,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,48,0,49,0,50,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,69,0,70,0,255,255,92,0,93,0,94,0,255,255,76,0,97,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,1,0,255,255,95,0,96,0,255,255,255,255,99,0,100,0,9,0,10,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,33,0,34,0,35,0,36,0,37,0,38,0,39,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,48,0,49,0,50,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,69,0,70,0].concat([255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,1,0,255,255,95,0,96,0,255,255,255,255,99,0,100,0,9,0,255,255,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,33,0,34,0,35,0,36,0,37,0,38,0,39,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,48,0,49,0,50,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,69,0,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,1,0,255,255,95,0,96,0,255,255,255,255,99,0,100,0,9,0,255,255,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,33,0,255,255,35,0,36,0,37,0,38,0,39,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,48,0,49,0,50,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,69,0,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,1,0,255,255,255,255,255,255,95,0,96,0,61,0,62,0,99,0,100,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,87,0,255,255,255,255,255,255,37,0,92,0,93,0,94,0,255,255,255,255,97,0,255,255,255,255,255,255,59,0,60,0,61,0,62,0,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,83,0,84,0,85,0,86,0,87,0,76,0,255,255,255,255,255,255,92,0,93,0,94,0,255,255,255,255,97,0,255,255,255,255,88,0,89,0,90,0,1,0,255,255,255,255,255,255,95,0,96,0,255,255,255,255,99,0,255,255,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,0,0,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,9,0,70,0,11,0,12,0,255,255,255,255,255,255,76,0,255,255,255,255,255,255,20,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,255,255,49,0,255,255,255,255,52,0,255,255,255,255,255,255,255,255,255,255,255,255,59,0,60,0,61,0,62,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,73,0,74,0,75,0,0,0,77,0,78,0,79,0,80,0,81,0,82,0,83,0,84,0,85,0,86,0,87,0,12,0,255,255,255,255,255,255,92,0,93,0,94,0,255,255,20,0,97,0,98,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,59,0,60,0,61,0,62,0,255,255,255,255,255,255,255,255,255,255,255,255,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,255,255,49,0,255,255,255,255,52,0,255,255,255,255,84,0,85,0,86,0,87,0,59,0,60,0,61,0,62,0,92,0,93,0,94,0,255,255,255,255,97,0,255,255,255,255,255,255,255,255,73,0,74,0,75,0,255,255,77,0,78,0,79,0,80,0,81,0,82,0,83,0,84,0,85,0,86,0,87,0,255,255,255,255,255,255,255,255,92,0,93,0,94,0,255,255,255,255,97,0,98,0,9,0,255,255,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,26,0,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,59,0,60,0,61,0,62,0,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,85,0,86,0,87,0,255,255,255,255,76,0,255,255,92,0,93,0,94,0,255,255,255,255,97,0,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,9,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,59,0,60,0,61,0,62,0,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,86,0,87,0,255,255,255,255,255,255,76,0,92,0,93,0,94,0,255,255,255,255,97,0,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,9,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,40,0,41,0,42,0,43,0,255,255,255,255,255,255,47,0,255,255,49,0,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,73,0,74,0,75,0,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,255,255,99,0,11,0,12,0,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,11,0,99,0,13,0,14,0,15,0,16,0,17,0,18,0,19,0,20,0,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,11,0,99,0,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,255,255,255,255,76,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,98,0,99,0,11,0,255,255,13,0,14,0,15,0,16,0,17,0,18,0,19,0,255,255,21,0,22,0,23,0,24,0,25,0,255,255,27,0,28,0,29,0,30,0,31,0,32,0,255,255,255,255,255,255,255,255,37,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,51,0,255,255,53,0,54,0,55,0,56,0,57,0,58,0,255,255,255,255,255,255,255,255,63,0,64,0,65,0,66,0,67,0,68,0,255,255,70,0,255,255,255,255,255,255,52,0,255,255,76,0,255,255,255,255,255,255,255,255,59,0,60,0,61,0,62,0,255,255,255,255,255,255,88,0,89,0,90,0,255,255,255,255,255,255,255,255,95,0,96,0,255,255,255,255,99,0,78,0,79,0,80,0,81,0,82,0,83,0,84,0,85,0,86,0,87,0,255,255,255,255,255,255,52,0,92,0,93,0,94,0,255,255,255,255,97,0,59,0,60,0,61,0,62,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,78,0,79,0,255,255,81,0,82,0,83,0,84,0,85,0,86,0,87,0,255,255,255,255,255,255,52,0,92,0,93,0,94,0,255,255,255,255,97,0,59,0,60,0,61,0,62,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,79,0,255,255,81,0,82,0,83,0,84,0,85,0,86,0,87,0,255,255,255,255,255,255,52,0,92,0,93,0,94,0,255,255,255,255,97,0,59,0,60,0,61,0,62,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,81,0,82,0,83,0,84,0,85,0,86,0,87,0,255,255,255,255,255,255,255,255,92,0,93,0,94,0,255,255,255,255,97,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,99,104,97,114,97,99,116,101,114,32,40,117,110,101,120,112,101,99,116,101,100,32,101,110,100,32,111,102,32,115,116,114,105,110,103,41,0,0,0,0,224,7,0,0,225,7,0,0,226,7,0,0,227,7,0,0,228,7,0,0,229,7,0,0,230,7,0,0,231,7,0,0,232,7,0,0,233,7,0,0,234,7,0,0,235,7,0,0,236,7,0,0,237,7,0,0,238,7,0,0,239,7,0,0,240,7,0,0,241,7,0,0,242,7,0,0,243,7,0,0,244,7,0,0,245,7,0,0,218,7,0,0,219,7,0,0,220,7,0,0,221,7,0,0,222,7,0,0,223,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,9,1,9,2,0,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,244,0,0,232,10,1,0,224,111,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,8,0,0,4,4,0,4,0,4,0,0,0,0,2,0,65,4,65,0,0,0,0,0,0,0,0,0,0,0,1,8,0,4,0,0,4,4,0,4,0,2,0,132,0,0,2,0,0,2,193,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,4,0,0,0,0,2,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,2,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,1,0,0,110,1,0,0,0,0,0,0,31,0,0,0,59,0,0,0,90,0,0,0,120,0,0,0,151,0,0,0,181,0,0,0,212,0,0,0,243,0,0,0,17,1,0,0,48,1,0,0,78,1,0,0,0,0,0,0,31,0,0,0,60,0,0,0,91,0,0,0,121,0,0,0,152,0,0,0,182,0,0,0,213,0,0,0,244,0,0,0,18,1,0,0,49,1,0,0,79,1,0,0,73,100,101,110,116,105,102,105,101,114,32,116,111,111,32,108,111,110,103,0,0,0,0,0,0,0,0,34,0,0,0,0,8,3,0,0,216,246,0,0,3,0,0,0,0,0,0,0,120,167,0,0,194,0,0,0,0,0,0,0,24,166,0,0,126,1,0,0,0,0,0,0,72,164,0,0,28,0,0,0,0,0,0,0,72,162,0,0,102,0,0,0,0,0,0,0,248,159,0,0,176,0,0,0,0,0,0,0,168,157,0,0,238,2,0,0,0,0,0,0,176,154,0,0,238,2,0,0,0,0,0,0,48,151,0,0,6,2,0,0,0,0,0,0,56,148,0,0,6,2,0,0,0,0,0,0,120,145,0,0,150,3,0,0,0,0,0,0,72,143,0,0,150,3,0,0,0,0,0,0,104,141,0,0,6,4,0,0,0,0,0,0,48,139,0,0,106,2,0,0,0,0,0,0,184,136,0,0,106,2,0,0,0,0,0,0,200,134,0,0,106,2,0,0,0,0,0,0,216,132,0,0,250,3,0,0,0,0,0,0,136,130,0,0,250,3,0,0,0,0,0,0,136,128,0,0,176,0,0,0,0,0,0,0,232,126,0,0,176,0,0,0,0,0,0,0,8,125,0,0,176,0,0,0,0,0,0,0,224,123,0,0,176,0,0,0,0,0,0,0,192,122,0,0,176,0,0,0,0,0,0,0,248,120,0,0,176,0,0,0,0,0,0,0,24,119,0,0,176,0,0,0,0,0,0,0,40,117,0,0,176,0,0,0,0,0,0,0,224,115,0,0,176,0,0,0,0,0,0,0,0,115,0,0,176,0,0,0,0,0,0,0,104,113,0,0,176,0,0,0,0,0,0,0,240,111,0,0,84,2,0,0,0,0,0,0,136,110,0,0,36,4,0,0,0,0,0,0,192,109,0,0,36,4,0,0,0,0,0,0,160,108,0,0,86,0,0,0,0,0,0,0,0,107,0,0,0,4,0,0,0,0,0,0,24,106,0,0,32,2,0,0,0,0,0,0,24,105,0,0,218,1,0,0,0,0,0,0,120,104,0,0,252,0,0,0,0,0,0,0,16,103,0,0,34,1,0,0,0,0,0,0,168,101,0,0,198,2,0,0,0,0,0,0,72,100,0,0,44,2,0,0,0,0,0,0,208,98,0,0,32,1,0,0,0,0,0,0,0,96,0,0,68,0,0,0,88,93,0,0,128,90,0,0,198,3,0,0,88,93,0,0,208,87,0,0,34,0,0,0,240,85,0,0,232,83,0,0,86,2,0,0,152,82,0,0,120,80,0,0,212,2,0,0,192,244,0,0,16,79,0,0,114,3,0,0,192,244,0,0,240,77,0,0,218,0,0,0,240,85,0,0,32,77,0,0,114,2,0,0,72,76,0,0,144,75,0,0,150,0,0,0,176,74,0,0,160,73,0,0,140,0,0,0,152,72,0,0,24,71,0,0,34,2,0,0,192,244,0,0,184,69,0,0,96,0,0,0,72,76,0,0,31,0,0,0,28,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,31,0,0,0,29,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,32,69,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,68,0,0,216,67,0,0,112,96,0,0,80,67,0,0,0,0,0,32,0,0,0,0,0,0,0,49,0,0,0,0,0,4,16,34,0,0,0,0,8,8,24,67,240,15,0,0,8,8,8,100,104,15,0,0,12,12,8,101,72,15,0,0,24,24,8,70,216,14,0,0,32,32,0,71,224,15,0,0,88,88,0,104,208,15,0,0,32,32,0,89,224,15,0,0,48,48,0,90,240,15,0,0,20,20,0,123,240,15,0,0,16,16,0,124,240,15,0,0,56,56,0,125,192,15,0,0,56,56,0,62,96,4,0,0,68,68,0,127,96,6,0,0,98,105,116,95,97,110,100,0,97,97,0,0,0,0,0,0,95,95,65,78,79,78,95,95,0,0,0,0,0,0,0,0,115,118,95,112,111,115,95,117,50,98,95,99,97,99,104,101,0,0,0,0,0,0,0,0,86,69,82,66,0,0,0,0,70,101,98,0,0,0,0,0,97,32,116,101,109,112,111,114,97,114,121,0,0,0,0,0,58,117,116,102,56,0,0,0,40,33,0,0,0,0,0,0,115,99,109,112,0,0,0,0,97,0,0,0,0,0,0,0,65,109,98,105,103,117,111,117,115,32,117,115,101,32,111,102,32,45,37,45,112,32,114,101,115,111,108,118,101,100,32,97,115,32,45,38,37,45,112,40,41,0,0,0,0,0,0,0,117,116,102,56,95,109,103,95,112,111,115,95,99,97,99,104,101,95,117,112,100,97,116,101,0,0,0,0,0,0,0,0,65,67,67,69,80,84,0,0,74,97,110,0,0,0,0,0,97,32,114,101,97,100,111,110,108,121,32,118,97,108,117,101,0,0,0,0,0,0,0,0,58,117,116,102,56,0,58,117,116,102,56,0,0,0,0,0,40,34,34,0,0,0,0,0,115,110,101,0,0,0,0,0,117,0,0,0,0,0,0,0,67,79,82,69,58,58,71,76,79,66,65,76,58,58,0,0,112,97,110,105,99,58,32,37,115,32,99,97,99,104,101,32,37,108,117,32,114,101,97,108,32,37,108,117,32,102,111,114,32,37,45,112,0,0,0,0,79,80,70,65,73,76,0,0,83,97,116,0,0,0,0,0,15,80,69,78,0,0,0,0,37,115,37,99,46,46,46,37,99,0,0,0,0,0,0,0,40,48,43,0,0,0,0,0,37,99,37,111,0,0,0,0,115,101,113,0,0,0,0,0,108,0,0,0,0,0,0,0,66,97,114,101,119,111,114,100,32,34,37,45,112,34,32,114,101,102,101,114,115,32,116,111,32,110,111,110,101,120,105,115,116,101,110,116,32,112,97,99,107,97,103,101,0,0,0,0,115,118,95,118,99,97,116,112,118,102,110,40,41,0,0,0,69,78,68,76,73,75,69,0,70,114,105,0,0,0,0,0,115,117,98,115,116,105,116,117,116,105,111,110,0,0,0,0,123,125,0,0,0,0,0,0,40,98,111,111,108,0,0,0,112,97,110,105,99,58,32,100,111,95,116,114,97,110,115,95,99,111,109,112,108,101,120,95,117,116,102,56,32,108,105,110,101,32,37,100,0,0,0,0,115,103,101,0,0,0,0,0,66,97,114,101,119,111,114,100,0,0,0,0,0,0,0,0,77,105,115,115,105,110,103,32,97,114,103,117,109,101,110,116,32,105,110,32,37,115,0,0,68,69,70,73,78,69,80,0,84,104,117,0,0,0,0,0,102,111,114,109,97,116,0,0,112,101,114,108,46,99,0,0,91,93,0,0,0,0,0,0,40,45,45,0,0,0,0,0,115,108,101,0,0,0,0,0,80,82,73,78,84,0,0,0,68,69,83,84,82,79,89,0,115,118,95,118,99,97,116,112,118,102,110,0,0,0,0,0,73,78,83,85,66,80,0,0,87,101,100,0,0,0,0,0,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,73,110,116,101,114,110,97,108,115,58,58,86,0,0,0,0,48,32,98,117,116,32,116,114,117,101,0,0,0,0,0,0,72,65,78,68,76,69,0,0,40,43,43,0,0,0,0,0,108,101,120,95,110,101,120,116,95,99,104,117,110,107,0,0,97,110,111,116,104,101,114,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,0,0,115,103,116,0,0,0,0,0,37,46,42,103,0,0,0,0,112,97,110,105,99,58,32,80,79,80,83,84,65,67,75,10,0,0,0,0,0,0,0,0,82,101,103,101,120,112,58,58,0,0,0,0,0,0,0,0,65,0,0,0,0,0,0,0,39,0,0,0,0,0,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,102,111,114,109,97,116,32,115,116,114,105,110,103,32,102,111,114,32,37,115,0,0,0,0,0,0,0,0,78,71,82,79,85,80,80,0,84,117,101,0,0,0,0,0,112,115,101,117,100,111,45,98,108,111,99,107,0,0,0,0,67,97,110,39,116,32,99,104,100,105,114,32,116,111,32,37,115,0,0,0,0,0,0,0,40,38,123,125,0,0,0,0,66,79,85,78,68,0,0,0,67,104,97,114,97,99,116,101,114,32,105,110,32,39,99,39,32,102,111,114,109,97,116,32,119,114,97,112,112,101,100,32,105,110,32,112,97,99,107,0,115,108,116,0,0,0,0,0,112,97,110,105,99,58,32,97,116,116,101,109,112,116,32,116,111,32,99,111,112,121,32,102,114,101,101,100,32,115,99,97,108,97,114,32,37,112,0,0,100,105,114,102,100,0,0,0,114,101,58,58,114,101,103,101,120,112,95,112,97,116,116,101,114,110,0,0,0,0,0,0,66,97,100,32,110,97,109,101,32,97,102,116,101,114,32,37,45,112,37,115,0,0,0,0,36,123,36,47,125,0,0,0,32,32,32,0,0,0,0,0,71,79,83,84,65,82,84,0,77,111,110,0,0,0,0,0,69,120,105,116,105,110,103,32,37,115,32,118,105,97,32,37,115,0,0,0,0,0,0,0,72,97,115,104,32,37,37,37,45,112,32,109,105,115,115,105,110,103,32,116,104,101,32,37,37,32,105,110,32,97,114,103,117,109,101,110,116,32,37,108,100,32,111,102,32,37,115,40,41,0,0,0,0,0,0,0,40,42,123,125,0,0,0,0,65,116,116,101,109,112,116,32,116,111,32,98,108,101,115,115,32,105,110,116,111,32,97,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,112,101,114,108,105,111,46,99,0,0,0,0,0,0,0,0,85,110,98,97,108,97,110,99,101,100,32,99,111,110,116,101,120,116,58,32,37,108,100,32,109,111,114,101,32,80,85,83,72,101,115,32,116,104,97,110,32,80,79,80,115,10,0,0,112,97,110,105,99,58,32,112,97,100,95,102,114,101,101,32,99,117,114,112,97,100,44,32,37,112,33,61,37,112,0,0,105,95,110,99,109,112,0,0,110,101,103,97,116,105,118,101,32,112,97,116,116,101,114,110,32,98,105,110,100,105,110,103,32,40,33,126,41,0,0,0,58,58,0,0,0,0,0,0,114,101,58,58,114,101,103,110,97,109,101,115,95,99,111,117,110,116,0,0,0,0,0,0,65,109,98,105,103,117,111,117,115,32,99,97,108,108,32,114,101,115,111,108,118,101,100,32,97,115,32,67,79,82,69,58,58,37,115,40,41,44,32,113,117,97,108,105,102,121,32,97,115,32,115,117,99,104,32,111,114,32,117,115,101,32,38,0,36,46,0,0,0,0,0,0,72,73,76,68,95,69,82,82,79,82,95,78,65,84,73,86,69,0,0,0,0,0,0,0,71,79,83,85,66,0,0,0,83,117,110,0,0,0,0,0,112,97,110,105,99,58,32,114,101,102,99,111,117,110,116,101,100,95,104,101,95,99,104,97,105,110,95,50,104,118,32,98,97,100,32,102,108,97,103,115,32,37,108,120,0,0,0,0,68,66,58,58,112,111,115,116,112,111,110,101,100,0,0,0,73,108,108,101,103,97,108,32,115,119,105,116,99,104,32,105,110,32,80,69,82,76,53,79,80,84,58,32,45,37,99,0,40,37,123,125,0,0,0,0,67,97,110,39,116,32,117,115,101,32,97,110,111,110,121,109,111,117,115,32,115,121,109,98,111,108,32,116,97,98,108,101,32,102,111,114,32,109,101,116,104,111,100,32,108,111,111,107,117,112,0,0,0,0,0,0,110,99,109,112,0,0,0,0,69,78,68,0,0,0,0,0,112,97,110,105,99,58,32,115,119,97,116,99,104,95,103,101,116,32,102,111,117,110,100,32,115,119,97,116,99,104,32,108,101,110,103,116,104,32,109,105,115,109,97,116,99,104,44,32,115,108,101,110,61,37,108,117,44,32,111,108,101,110,61,37,108,117,0,0,0,0,0,0,59,36,0,0,0,0,0,0,100,117,109,112,40,41,32,98,101,116,116,101,114,32,119,114,105,116,116,101,110,32,97,115,32,67,79,82,69,58,58,100,117,109,112,40,41,0,0,0,36,95,0,0,0,0,0,0,65,72,79,67,79,82,65,83,73,67,75,67,0,0,0,0,103,109,116,105,109,101,0,0,67,111,109,112,105,108,97,116,105,111,110,32,101,114,114,111,114,0,0,0,0,0,0,0,67,68,73,77,85,100,109,116,119,87,0,0,0,0,0,0,65,114,114,97,121,32,64,37,45,112,32,109,105,115,115,105,110,103,32,116,104,101,32,64,32,105,110,32,97,114,103,117,109,101,110,116,32,37,108,100,32,111,102,32,37,115,40,41,0,0,0,0,0,0,0,0,40,64,123,125,0,0,0,0,67,97,110,39,116,32,111,112,101,110,32,98,105,100,105,114,101,99,116,105,111,110,97,108,32,112,105,112,101,0,0,0,105,95,110,101,0,0,0,0,112,97,110,105,99,58,32,115,119,97,116,99,104,95,103,101,116,32,103,111,116,32,105,109,112,114,111,112,101,114,32,115,119,97,116,99,104,0,0,0,114,101,58,58,114,101,103,110,97,109,101,115,0,0,0,0,66,97,100,32,112,108,117,103,105,110,32,97,102,102,101,99,116,105,110,103,32,107,101,121,119,111,114,100,32,39,37,115,39,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,65,72,79,67,79,82,65,83,73,67,75,0,0,0,0,0,108,111,99,97,108,116,105,109,101,0,0,0,0,0,0,0,37,45,112,67,111,109,112,105,108,97,116,105,111,110,32,102,97,105,108,101,100,32,105,110,32,114,101,103,101,120,112,0,80,69,82,76,53,79,80,84,0,0,0,0,0,0,0,0,85,115,101,108,101,115,115,32,117,115,101,32,111,102,32,37,115,32,119,105,116,104,32,110,111,32,118,97,108,117,101,115,0,0,0,0,0,0,0,0,40,36,123,125,0,0,0,0,110,101,0,0,0,0,0,0,112,97,110,105,99,58,32,115,119,97,116,99,104,95,103,101,116,32,102,111,117,110,100,32,115,119,97,116,99,104,32,115,105,122,101,32,109,105,115,109,97,116,99,104,44,32,98,105,116,115,61,37,108,117,44,32,111,116,104,101,114,98,105,116,115,61,37,108,117,0,0,0,59,36,36,0,0,0,0,0,67,79,82,69,0,0,0,0,84,82,73,69,67,0,0,0,115,101,116,112,114,105,111,114,105,116,121,40,41,0,0,0,99,0,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,115,119,105,116,99,104,58,32,45,37,115,32,32,40,45,104,32,119,105,108,108,32,115,104,111,119,32,118,97,108,105,100,32,111,112,116,105,111,110,115,41,0,0,67,97,110,39,116,32,117,115,101,32,98,97,114,101,119,111,114,100,32,40,34,37,45,112,34,41,32,97,115,32,37,115,32,114,101,102,32,119,104,105,108,101,32,34,115,116,114,105,99,116,32,114,101,102,115,34,32,105,110,32,117,115,101,0,105,95,101,113,0,0,0,0,112,97,110,105,99,58,32,115,119,97,116,99,104,95,103,101,116,32,100,111,101,115,110,39,116,32,101,120,112,101,99,116,32,98,105,116,115,32,37,108,117,0,0,0,0,0,0,0,114,101,58,58,114,101,103,110,97,109,101,0,0,0,0,0,66,97,99,107,115,108,97,115,104,0,0,0,0,0,0,0,84,82,73,69,0,0,0,0,103,101,116,112,114,105,111,114,105,116,121,40,41,0,0,0,46,112,109,0,0,0,0,0,104,101,108,112,0,0,0,0,67,111,110,115,116,97,110,116,32,105,115,32,110,111,116,32,37,115,32,114,101,102,101,114,101,110,99,101,0,0,0,0,112,97,110,105,99,58,32,103,118,32,110,97,109,101,32,116,111,111,32,108,111,110,103,32,40,37,108,117,41,0,0,0,37,99,37,48,51,111,0,0,101,113,0,0,0,0,0,0,37,115,58,32,105,108,108,101,103,97,108,32,109,97,112,112,105,110,103,32,39,37,115,39,0,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,67,97,110,39,116,32,117,115,101,32,92,37,99,32,116,111,32,109,101,97,110,32,36,37,99,32,105,110,32,101,120,112,114,101,115,115,105,111,110,0,119,105,116,104,105,110,32,0,82,69,78,85,77,0,0,0,115,101,116,112,103,114,112,40,41,0,0,0,0,0,0,0,83,109,97,114,116,32,109,97,116,99,104,105,110,103,32,97,32,110,111,110,45,111,118,101,114,108,111,97,100,101,100,32,111,98,106,101,99,116,32,98,114,101,97,107,115,32,101,110,99,97,112,115,117,108,97,116,105,111,110,0,0,0,0,0,97,32,67,79,68,69,0,0,67,111,112,121,32,109,101,116,104,111,100,32,100,105,100,32,110,111,116,32,114,101,116,117,114,110,32,97,32,114,101,102,101,114,101,110,99,101,0,0,105,95,103,101,0,0,0,0,86,69,82,83,73,79,78,0,46,46,46,0,0,0,0,0,114,101,58,58,105,115,95,114,101,103,101,120,112,0,0,0,66,97,99,107,116,105,99,107,115,0,0,0,0,0,0,0,91,37,108,100,93,0,0,0,76,79,71,73,67,65,76,0,103,101,116,112,103,114,112,40,41,0,0,0,0,0,0,0,82,101,112,101,97,116,101,100,32,102,111,114,109,97,116,32,108,105,110,101,32,119,105,108,108,32,110,101,118,101,114,32,116,101,114,109,105,110,97,116,101,32,40,126,126,32,97,110,100,32,64,35,41,0,0,0,117,115,101,32,67,111,110,102,105,103,59,32,67,111,110,102,105,103,58,58,99,111,110,102,105,103,95,118,97,114,115,40,113,119,37,99,37,115,37,99,41,0,0,0,0,0,0,0,97,32,72,65,83,72,0,0,115,116,117,98,0,0,0,0,103,101,0,0,0,0,0,0,46,10,0,0,0,0,0,0,92,120,123,37,108,120,125,0,73,110,116,101,114,110,97,108,115,58,58,72,118,82,69,72,65,83,72,0,0,0,0,0,83,116,114,105,110,103,0,0,123,37,115,125,0,0,0,0,77,73,78,77,79,68,0,0,37,115,32,40,37,100,32,98,121,116,101,37,115,44,32,110,101,101,100,32,37,100,44,32,97,102,116,101,114,32,115,116,97,114,116,32,98,121,116,101,32,48,120,37,48,50,120,41,0,0,0,0,0,0,0,0,103,101,116,112,112,105,100,0,78,117,108,108,32,112,105,99,116,117,114,101,32,105,110,32,102,111,114,109,108,105,110,101,0,0,0,0,0,0,0,0,117,115,101,32,67,111,110,102,105,103,59,32,67,111,110,102,105,103,58,58,95,86,40,41,0,0,0,0,0,0,0,0,79,99,116,97,108,32,110,117,109,98,101,114,32,62,32,48,51,55,55,55,55,55,55,55,55,55,55,32,110,111,110,45,112,111,114,116,97,98,108,101,0,0,0,0,0,0,0,0,97,110,32,65,82,82,65,89,0,0,0,0,0,0,0,0,37,37,69,78,86,32,105,115,32,97,108,105,97,115,101,100,32,116,111,32,37,115,37,115,0,0,0,0,0,0,0,0,105,95,108,101,0,0,0,0,92,0,0,0,0,0,0,0,73,110,116,101,114,110,97,108,115,58,58,114,101,104,97,115,104,95,115,101,101,100,0,0,78,117,109,98,101,114,0,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,32,116,111,32,115,118,95,99,97,116,95,100,101,99,111,100,101,0,0,0,0,0,0,0,69,86,65,76,0,0,0,0,101,120,101,99,0,0,0,0,67,97,110,39,116,32,34,98,114,101,97,107,34,32,105,110,32,97,32,108,111,111,112,32,116,111,112,105,99,97,108,105,122,101,114,0,0,0,0,0,78,111,32,99,111,100,101,32,115,112,101,99,105,102,105,101,100,32,102,111,114,32,45,37,99,0,0,0,0,0,0,0,44,10,9,114,105,103,104,116,32,97,114,103,117,109,101,110,116,32,104,97,115,32,110,111,32,111,118,101,114,108,111,97,100,101,100,32,109,97,103,105,99,0,0,0,0,0,0,0,83,69,79,76,0,0,0,0,112,97,110,105,99,58,32,112,114,101,100,105,99,116,101,100,32,117,116,102,56,32,108,101,110,103,116,104,32,110,111,116])
.concat([32,97,118,97,105,108,97,98,108,101,44,32,102,111,114,32,39,37,99,39,44,32,97,112,116,114,61,37,112,32,101,110,100,61,37,112,32,99,117,114,61,37,112,44,32,102,114,111,109,108,101,110,61,37,108,117,0,0,0,0,0,0,0,0,87,97,114,110,105,110,103,58,32,115,111,109,101,116,104,105,110,103,39,115,32,119,114,111,110,103,0,0,0,0,0,0,108,101,0,0,0,0,0,0,104,97,115,104,0,0,0,0,73,110,116,101,114,110,97,108,115,58,58,104,97,115,104,95,115,101,101,100,0,0,0,0,85,115,101,32,111,102,32,63,80,65,84,84,69,82,78,63,32,119,105,116,104,111,117,116,32,101,120,112,108,105,99,105,116,32,111,112,101,114,97,116,111,114,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,0,0,0,99,97,116,95,100,101,99,111,100,101,0,0,0,0,0,0,37,42,46,42,102,0,0,0,66,82,65,78,67,72,74,0,67,97,110,39,116,32,34,98,114,101,97,107,34,32,111,117,116,115,105,100,101,32,97,32,103,105,118,101,110,32,98,108,111,99,107,0,0,0,0,0,37,115,32,97,114,103,117,109,101,110,116,32,105,115,32,110,111,116,32,97,32,72,65,83,72,32,111,114,32,65,82,82,65,89,32,101,108,101,109,101,110,116,32,111,114,32,97,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,44,10,9,114,105,103,104,116,32,97,114,103,117,109,101,110,116,32,105,110,32,111,118,101,114,108,111,97,100,101,100,32,112,97,99,107,97,103,101,32,0,0,0,0,0,0,0,0,67,97,110,39,116,32,102,105,110,100,32,97,110,32,111,112,110,117,109,98,101,114,32,102,111,114,32,34,37,115,34,0,85,110,105,109,112,108,101,109,101,110,116,101,100,0,0,0,80,101,114,108,73,79,58,58,76,97,121,101,114,58,58,102,105,110,100,0,0,0,0,0,85,110,98,97,108,97,110,99,101,100,32,116,109,112,115,58,32,37,108,100,32,109,111,114,101,32,97,108,108,111,99,115,32,116,104,97,110,32,102,114,101,101,115,10,0,0,0,0,112,97,110,105,99,58,32,112,97,100,95,115,119,105,112,101,32,112,111,61,37,108,100,44,32,102,105,108,108,61,37,108,100,0,0,0,0,0,0,0,112,105,112,101,100,32,111,112,101,110,0,0,0,0,0,0,105,95,103,116,0,0,0,0,85,115,101,108,101,115,115,32,117,115,101,32,111,102,32,115,111,114,116,32,105,110,32,115,99,97,108,97,114,32,99,111,110,116,101,120,116,0,0,0,112,97,110,105,99,58,32,109,121,95,115,110,112,114,105,110,116,102,32,98,117,102,102,101,114,32,111,118,101,114,102,108,111,119,0,0,0,0,0,0,112,114,105,110,116,0,0,0,42,59,64,0,0,0,0,0,115,116,117,100,121,0,0,0,100,101,99,111,100,101,0,0,76,79,78,71,74,77,80,0,115,121,115,116,101,109,0,0,67,97,110,39,116,32,34,99,111,110,116,105,110,117,101,34,32,111,117,116,115,105,100,101,32,97,32,119,104,101,110,32,98,108,111,99,107,0,0,0,10,85,115,97,103,101,58,32,37,115,32,91,115,119,105,116,99,104,101,115,93,32,91,45,45,93,32,91,112,114,111,103,114,97,109,102,105,108,101,93,32,91,97,114,103,117,109,101,110,116,115,93,10,0,0,0,37,115,32,97,114,103,117,109,101,110,116,32,105,115,32,110,111,116,32,97,32,115,117,98,114,111,117,116,105,110,101,32,110,97,109,101,0,0,0,0,104,97,115,32,110,111,32,111,118,101,114,108,111,97,100,101,100,32,109,97,103,105,99,0,103,116,0,0,0,0,0,0,89,111,117,114,32,114,97,110,100,111,109,32,110,117,109,98,101,114,115,32,97,114,101,32,110,111,116,32,116,104,97,116,32,114,97,110,100,111,109,0,112,97,110,105,99,58,32,95,115,119,97,115,104,95,116,111,95,105,110,118,108,105,115,116,32,111,110,108,121,32,111,112,101,114,97,116,101,115,32,111,110,32,98,111,111,108,101,97,110,32,112,114,111,112,101,114,116,105,101,115,44,32,98,105,116,115,61,37,108,117,44,32,111,116,104,101,114,98,105,116,115,61,37,108,117,0,0,0,80,101,114,108,73,79,58,58,103,101,116,95,108,97,121,101,114,115,0,0,0,0,0,0,83,99,97,108,97,114,32,118,97,108,117,101,32,37,45,112,32,98,101,116,116,101,114,32,119,114,105,116,116,101,110,32,97,115,32,36,37,45,112,0,71,82,79,85,80,80,0,0,99,108,111,115,101,100,105,114,40,41,32,97,116,116,101,109,112,116,101,100,32,111,110,32,105,110,118,97,108,105,100,32,100,105,114,104,97,110,100,108,101,32,37,50,112,0,0,0,119,104,101,110,0,0,0,0,32,32,45,119,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,101,110,97,98,108,101,32,109,97,110,121,32,117,115,101,102,117,108,32,119,97,114,110,105,110,103,115,10,32,32,45,87,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,101,110,97,98,108,101,32,97,108,108,32,119,97,114,110,105,110,103,115,10,32,32,45,120,91,100,105,114,101,99,116,111,114,121,93,32,32,32,32,32,105,103,110,111,114,101,32,116,101,120,116,32,98,101,102,111,114,101,32,35,33,112,101,114,108,32,108,105,110,101,32,40,111,112,116,105,111,110,97,108,108,121,32,99,100,32,116,111,32,100,105,114,101,99,116,111,114,121,41,10,32,32,45,88,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,100,105,115,97,98,108,101,32,97,108,108,32,119,97,114,110,105,110,103,115,10,32,32,10,82,117,110,32,39,112,101,114,108,100,111,99,32,112,101,114,108,39,32,102,111,114,32,109,111,114,101,32,104,101,108,112,32,119,105,116,104,32,80,101,114,108,46,10,10,0,0,0,0,0,0,0,117,110,105,101,118,97,108,0,105,110,32,111,118,101,114,108,111,97,100,101,100,32,112,97,99,107,97,103,101,32,0,0,87,97,114,110,105,110,103,58,32,117,110,97,98,108,101,32,116,111,32,99,108,111,115,101,32,102,105,108,101,104,97,110,100,108,101,32,37,50,112,32,112,114,111,112,101,114,108,121,46,10,0,0,0,0,0,0,105,95,108,116,0,0,0,0,80,69,82,76,95,72,65,83,72,95,83,69,69,68,0,0,73,78,86,69,82,84,95,73,84,0,0,0,0,0,0,0,92,37,0,0,0,0,0,0,32,9,36,35,43,45,39,34,0,0,0,0,0,0,0,0,73,70,84,72,69,78,0,0,114,101,119,105,110,100,100,105,114,0,0,0,0,0,0,0,100,101,102,97,117,108,116,0,32,32,45,116,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,101,110,97,98,108,101,32,116,97,105,110,116,105,110,103,32,119,97,114,110,105,110,103,115,10,32,32,45,84,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,101,110,97,98,108,101,32,116,97,105,110,116,105,110,103,32,99,104,101,99,107,115,10,32,32,45,117,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,100,117,109,112,32,99,111,114,101,32,97,102,116,101,114,32,112,97,114,115,105,110,103,32,112,114,111,103,114,97,109,10,32,32,45,85,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,97,108,108,111,119,32,117,110,115,97,102,101,32,111,112,101,114,97,116,105,111,110,115,10,32,32,45,118,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,112,114,105,110,116,32,118,101,114,115,105,111,110,44,32,112,97,116,99,104,108,101,118,101,108,32,97,110,100,32,108,105,99,101,110,115,101,10,32,32,45,86,91,58,118,97,114,105,97,98,108,101,93,32,32,32,32,32,112,114,105,110,116,32,99,111,110,102,105,103,117,114,97,116,105,111,110,32,115,117,109,109,97,114,121,32,40,111,114,32,97,32,115,105,110,103,108,101,32,67,111,110,102,105,103,46,112,109,32,118,97,114,105,97,98,108,101,41,10,0,0,0,0,0,37,115,32,97,114,103,117,109,101,110,116,32,105,115,32,110,111,116,32,97,32,72,65,83,72,32,111,114,32,65,82,82,65,89,32,101,108,101,109,101,110,116,32,111,114,32,115,108,105,99,101,0,0,0,0,0,10,9,108,101,102,116,32,0,108,116,0,0,0,0,0,0,47,100,101,118,47,117,114,97,110,100,111,109,0,0,0,0,69,88,84,82,65,83,0,0,73,110,116,101,114,110,97,108,115,58,58,104,118,95,99,108,101,97,114,95,112,108,97,99,101,104,111,108,100,101,114,115,0,0,0,0,0,0,0,0,65,114,114,97,121,0,0,0,101,110,100,32,111,102,32,115,116,114,105,110,103,0,0,0,83,85,83,80,69,78,68,0,115,101,101,107,100,105,114,0,67,97,110,39,116,32,34,37,115,34,32,111,117,116,115,105,100,101,32,97,32,116,111,112,105,99,97,108,105,122,101,114,0,0,0,0,0,0,0,0,32,32,45,108,91,111,99,116,97,108,93,32,32,32,32,32,32,32,32,32,101,110,97,98,108,101,32,108,105,110,101,32,101,110,100,105,110,103,32,112,114,111,99,101,115,115,105,110,103,44,32,115,112,101,99,105,102,105,101,115,32,108,105,110,101,32,116,101,114,109,105,110,97,116,111,114,10,32,32,45,91,109,77,93,91,45,93,109,111,100,117,108,101,32,32,32,32,101,120,101,99,117,116,101,32,34,117,115,101,47,110,111,32,109,111,100,117,108,101,46,46,46,34,32,98,101,102,111,114,101,32,101,120,101,99,117,116,105,110,103,32,112,114,111,103,114,97,109,10,32,32,45,110,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,97,115,115,117,109,101,32,34,119,104,105,108,101,32,40,60,62,41,32,123,32,46,46,46,32,125,34,32,108,111,111,112,32,97,114,111,117,110,100,32,112,114,111,103,114,97,109,10,32,32,45,112,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,97,115,115,117,109,101,32,108,111,111,112,32,108,105,107,101,32,45,110,32,98,117,116,32,112,114,105,110,116,32,108,105,110,101,32,97,108,115,111,44,32,108,105,107,101,32,115,101,100,10,32,32,45,115,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,101,110,97,98,108,101,32,114,117,100,105,109,101,110,116,97,114,121,32,112,97,114,115,105,110,103,32,102,111,114,32,115,119,105,116,99,104,101,115,32,97,102,116,101,114,32,112,114,111,103,114,97,109,102,105,108,101,10,32,32,45,83,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,108,111,111,107,32,102,111,114,32,112,114,111,103,114,97,109,102,105,108,101,32,117,115,105,110,103,32,80,65,84,72,32,101,110,118,105,114,111,110,109,101,110,116,32,118,97,114,105,97,98,108,101,10,0,0,36,91,32,117,115,101,100,32,105,110,32,37,115,32,40,100,105,100,32,121,111,117,32,109,101,97,110,32,36,93,32,63,41,0,0,0,0,0,0,0,114,105,103,104,116,95,115,104,105,102,116,0,0,0,0,0,85,110,107,110,111,119,110,32,85,110,105,99,111,100,101,32,111,112,116,105,111,110,32,118,97,108,117,101,32,37,108,117,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,117,110,101,120,112,101,99,116,101,100,32,101,110,116,114,121,32,102,111,114,32,37,115,0,0,73,110,116,101,114,110,97,108,115,58,58,83,118,82,69,70,67,78,84,0,0,0,0,0,38,42,60,37,0,0,0,0,85,78,76,69,83,83,77,0,116,101,108,108,100,105,114,0,95,60,40,101,118,97,108,32,37,108,117,41,0,0,0,0,32,32,45,101,32,112,114,111,103,114,97,109,32,32,32,32,32,32,32,32,111,110,101,32,108,105,110,101,32,111,102,32,112,114,111,103,114,97,109,32,40,115,101,118,101,114,97,108,32,45,101,39,115,32,97,108,108,111,119,101,100,44,32,111,109,105,116,32,112,114,111,103,114,97,109,102,105,108,101,41,10,32,32,45,69,32,112,114,111,103,114,97,109,32,32,32,32,32,32,32,32,108,105,107,101,32,45,101,44,32,98,117,116,32,101,110,97,98,108,101,115,32,97,108,108,32,111,112,116,105,111,110,97,108,32,102,101,97,116,117,114,101,115,10,32,32,45,102,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,100,111,110,39,116,32,100,111,32,36,115,105,116,101,108,105,98,47,115,105,116,101,99,117,115,116,111,109,105,122,101,46,112,108,32,97,116,32,115,116,97,114,116,117,112,10,32,32,45,70,47,112,97,116,116,101,114,110,47,32,32,32,32,32,32,32,115,112,108,105,116,40,41,32,112,97,116,116,101,114,110,32,102,111,114,32,45,97,32,115,119,105,116,99,104,32,40,47,47,39,115,32,97,114,101,32,111,112,116,105,111,110,97,108,41,10,32,32,45,105,91,101,120,116,101,110,115,105,111,110,93,32,32,32,32,32,101,100,105,116,32,60,62,32,102,105,108,101,115,32,105,110,32,112,108,97,99,101,32,40,109,97,107,101,115,32,98,97,99,107,117,112,32,105,102,32,101,120,116,101,110,115,105,111,110,32,115,117,112,112,108,105,101,100,41,10,32,32,45,73,100,105,114,101,99,116,111,114,121,32,32,32,32,32,32,32,115,112,101,99,105,102,121,32,64,73,78,67,47,35,105,110,99,108,117,100,101,32,100,105,114,101,99,116,111,114,121,32,40,115,101,118,101,114,97,108,32,45,73,39,115,32,97,108,108,111,119,101,100,41,10,0,0,0,0,0,80,111,115,115,105,98,108,101,32,112,114,101,99,101,100,101,110,99,101,32,112,114,111,98,108,101,109,32,111,110,32,98,105,116,119,105,115,101,32,37,99,32,111,112,101,114,97,116,111,114,0,0,0,0,0,0,79,112,101,114,97,116,105,111,110,32,34,37,115,34,58,32,110,111,32,109,101,116,104,111,100,32,102,111,117,110,100,44,37,115,97,114,103,117,109,101,110,116,32,37,115,37,45,112,37,115,37,45,112,0,0,0,37,99,120,123,37,108,120,125,0,0,0,0,0,0,0,0,108,101,102,116,95,115,104,105,102,116,0,0,0,0,0,0,85,110,107,110,111,119,110,32,85,110,105,99,111,100,101,32,111,112,116,105,111,110,32,108,101,116,116,101,114,32,39,37,99,39,0,0,0,0,0,0,112,97,110,105,99,58,32,97,118,95,102,101,116,99,104,40,41,32,117,110,101,120,112,101,99,116,101,100,108,121,32,102,97,105,108,101,100,0,0,0,92,91,36,37,64,93,59,36,0,0,0,0,0,0,0,0,36,64,34,39,96,113,0,0,92,37,48,51,108,111,0,0,73,70,77,65,84,67,72,0,114,101,97,100,100,105,114,40,41,32,97,116,116,101,109,112,116,101,100,32,111,110,32,105,110,118,97,108,105,100,32,100,105,114,104,97,110,100,108,101,32,37,50,112,0,0,0,0,95,60,40,101,118,97,108,32,37,108,117,41,91,37,115,58,37,108,100,93,0,0,0,0,32,32,45,48,91,111,99,116,97,108,93,32,32,32,32,32,32,32,32,32,115,112,101,99,105,102,121,32,114,101,99,111,114,100,32,115,101,112,97,114,97,116,111,114,32,40,92,48,44,32,105,102,32,110,111,32,97,114,103,117,109,101,110,116,41,10,32,32,45,97,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,97,117,116,111,115,112,108,105,116,32,109,111,100,101,32,119,105,116,104,32,45,110,32,111,114,32,45,112,32,40,115,112,108,105,116,115,32,36,95,32,105,110,116,111,32,64,70,41,10,32,32,45,67,91,110,117,109,98,101,114,47,108,105,115,116,93,32,32,32,101,110,97,98,108,101,115,32,116,104,101,32,108,105,115,116,101,100,32,85,110,105,99,111,100,101,32,102,101,97,116,117,114,101,115,10,32,32,45,99,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,99,104,101,99,107,32,115,121,110,116,97,120,32,111,110,108,121,32,40,114,117,110,115,32,66,69,71,73,78,32,97,110,100,32,67,72,69,67,75,32,98,108,111,99,107,115,41,10,32,32,45,100,91,58,100,101,98,117,103,103,101,114,93,32,32,32,32,32,114,117,110,32,112,114,111,103,114,97,109,32,117,110,100,101,114,32,100,101,98,117,103,103,101,114,10,32,32,45,68,91,110,117,109,98,101,114,47,108,105,115,116,93,32,32,32,115,101,116,32,100,101,98,117,103,103,105,110,103,32,102,108,97,103,115,32,40,97,114,103,117,109,101,110,116,32,105,115,32,97,32,98,105,116,32,109,97,115,107,32,111,114,32,97,108,112,104,97,98,101,116,115,41,10,0,0,0,0,0,0,0,0,85,115,105,110,103,32,97,32,104,97,115,104,32,97,115,32,97,32,114,101,102,101,114,101,110,99,101,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,0,0,111,118,101,114,108,111,97,100,105,110,103,0,0,0,0,0,115,116,114,105,110,103,105,102,121,0,0,0,0,0,0,0,46,48,0,0,0,0,0,0,112,97,110,105,99,58,32,118,97,108,117,101,32,114,101,116,117,114,110,101,100,32,102,114,111,109,32,104,118,95,105,116,101,114,110,101,120,116,115,118,40,41,32,117,110,101,120,112,101,99,116,101,100,108,121,32,105,115,32,110,111,116,32,97,32,115,116,114,105,110,103,44,32,102,108,97,103,115,61,37,108,117,0,0,0,0,0,0,73,110,116,101,114,110,97,108,115,58,58,83,118,82,69,65,68,79,78,76,89,0,0,0,89,111,117,32,110,101,101,100,32,116,111,32,113,117,111,116,101,32,34,37,45,112,34,0,34,37,0,0,0,0,0,0,78,82,69,70,70,65,0,0,79,112,101,110,105,110,103,32,102,105,108,101,104,97,110,100,108,101,32,37,50,112,32,97,108,115,111,32,97,115,32,97,32,100,105,114,101,99,116,111,114,121,0,0,0,0,0,0,101,118,97,108,0,0,0,0,10,80,101,114,108,32,109,97,121,32,98,101,32,99,111,112,105,101,100,32,111,110,108,121,32,117,110,100,101,114,32,116,104,101,32,116,101,114,109,115,32,111,102,32,101,105,116,104,101,114,32,116,104,101,32,65,114,116,105,115,116,105,99,32,76,105,99,101,110,115,101,32,111,114,32,116,104,101,10,71,78,85,32,71,101,110,101,114,97,108,32,80,117,98,108,105,99,32,76,105,99,101,110,115,101,44,32,119,104,105,99,104,32,109,97,121,32,98,101,32,102,111,117,110,100,32,105,110,32,116,104,101,32,80,101,114,108,32,53,32,115,111,117,114,99,101,32,107,105,116,46,10,10,67,111,109,112,108,101,116,101,32,100,111,99,117,109,101,110,116,97,116,105,111,110,32,102,111,114,32,80,101,114,108,44,32,105,110,99,108,117,100,105,110,103,32,70,65,81,32,108,105,115,116,115,44,32,115,104,111,117,108,100,32,98,101,32,102,111,117,110,100,32,111,110,10,116,104,105,115,32,115,121,115,116,101,109,32,117,115,105,110,103,32,34,109,97,110,32,112,101,114,108,34,32,111,114,32,34,112,101,114,108,100,111,99,32,112,101,114,108,34,46,32,32,73,102,32,121,111,117,32,104,97,118,101,32,97,99,99,101,115,115,32,116,111,32,116,104,101,10,73,110,116,101,114,110,101,116,44,32,112,111,105,110,116,32,121,111,117,114,32,98,114,111,119,115,101,114,32,97,116,32,104,116,116,112,58,47,47,119,119,119,46,112,101,114,108,46,111,114,103,47,44,32,116,104,101,32,80,101,114,108,32,72,111,109,101,32,80,97,103,101,46,10,10,0,0,0,0,0,0,0,0,85,115,105,110,103,32,97,110,32,97,114,114,97,121,32,97,115,32,97,32,114,101,102,101,114,101,110,99,101,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,79,118,101,114,108,111,97,100,101,100,32,100,101,114,101,102,101,114,101,110,99,101,32,100,105,100,32,110,111,116,32,114,101,116,117,114,110,32,97,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,110,117,108,108,0,0,0,0,99,111,110,99,97,116,0,0,32,100,117,114,105,110,103,32,103,108,111,98,97,108,32,100,101,115,116,114,117,99,116,105,111,110,0,0,0,0,0,0,95,37,108,100,0,0,0,0,112,97,110,105,99,58,32,115,119,97,115,104,95,105,110,118,101,114,115,105,111,110,95,104,97,115,104,32,100,111,101,115,110,39,116,32,101,120,112,101,99,116,32,98,105,116,115,32,37,108,117,0,0,0,0,0,117,116,102,56,58,58,117,110,105,99,111,100,101,95,116,111,95,110,97,116,105,118,101,0,83,73,71,0,0,0,0,0,78,82,69,70,70,85,0,0,37,115,32,40,117,110,101,120,112,101,99,116,101,100,32,110,111,110,45,99,111,110,116,105,110,117,97,116,105,111,110,32,98,121,116,101,32,48,120,37,48,50,120,44,32,37,100,32,98,121,116,101,115,32,97,102,116,101,114,32,115,116,97,114,116,32,98,121,116,101,32,48,120,37,48,50,120,44,32,101,120,112,101,99,116,101,100,32,37,100,32,98,121,116,101,115,41,0,0,0,0,0,0,0,114,109,100,105,114,0,0,0,67,97,110,39,116,32,108,111,99,97,116,101,32,37,115,0,10,10,67,111,112,121,114,105,103,104,116,32,49,57,56,55,45,50,48,49,50,44,32,76,97,114,114,121,32,87,97,108,108,10,0,0,0,0,0,0,67,97,110,110,111,116,32,102,105,110,100,32,118,101,114,115,105,111,110,32,111,102,32,97,110,32,117,110,98,108,101,115,115,101,100,32,114,101,102,101,114,101,110,99,101,0,0,0,73,108,108,101,103,97,108,32,111,99,116,97,108,32,100,105,103,105,116,32,39,37,99,39,32,105,103,110,111,114,101,100,0,0,0,0,0,0,0,0,111,111,112,115,58,32,111,111,112,115,72,86,0,0,0,0,66,65,83,72,95,69,78,86,0,0,0,0,0,0,0,0,105,95,115,117,98,116,114,97,99,116,0,0,0,0,0,0,37,108,117,0,0,0,0,0,46,37,108,100,0,0,0,0,83,80,69,67,73,65,76,83,0,0,0,0,0,0,0,0,117,116,102,56,58,58,110,97,116,105,118,101,95,116,111,95,117,110,105,99,111,100,101,0,77,117,108,116,105,100,105,109,101,110,115,105,111,110,97,108,32,115,121,110,116,97,120,32,37,46,42,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,0,73,110,118,97,108,105,100,32,99,111,110,118,101,114,115,105,111,110,32,105,110,32,37,115,112,114,105,110,116,102,58,32,0,0,0,0,0,0,0,0,78,82,69,70,70,76,0,0,109,107,100,105,114,0,0,0,32,40,100,105,100,32,121,111,117,32,114,117,110,32,104,50,112,104,63,41,0,0,0,0,10,84,104,105,115,32,105,115,32,112,101,114,108,32,53,44,32,118,101,114,115,105,111,110,32,49,54,44,32,115,117,98,118,101,114,115,105,111,110,32,51,32,40,37,45,112,41,32,98,117,105,108,116,32,102,111,114,32,117,110,107,110,111,119,110,0,0,0,0,0,0,0,111,111,112,115,58,32,111,111,112,115,65,86,0,0,0,0,67,97,110,39,116,32,114,101,115,111,108,118,101,0,0,0,77,69,79,76,0,0,0,0,39,37,99,39,32,111,117,116,115,105,100,101,32,111,102,32,115,116,114,105,110,103,32,105,110,32,112,97,99,107,0,0,9,46,46,46,99,97,117,103,104,116,0,0,0,0,0,0,115,117,98,116,114,97,99,116,0,0,0,0,0,0,0,0,97,114,114,97,121,0,0,0,118,37,108,100,0,0,0,0,78,79,78,69,0,0,0,0,117,116,102,56,58,58,100,111,119,110,103,114,97,100,101,0,70,105,110,97,108,32,36,32,115,104,111,117,108,100,32,98,101,32,92,36,32,111,114,32,36,110,97,109,101,0,0,0,112,97,110,105,99,58,32,102,114,101,120,112,0,0,0,0,37,35,42,46,42,102,0,0,78,82,69,70,70,0,0,0,114,101,110,97,109,101,0,0,46,112,104,0,0,0,0,0,32,40,37,45,112,41,0,0,70,111,114,109,97,116,32,83,84,68,79,85,84,32,114,101,100,101,102,105,110,101,100,0,83,116,117,98,32,102,111,117,110,100,32,119,104,105,108,101,32,114,101,115,111,108,118,105,110,103,0,0,0,0,0,0,67,79,82,69,58,58,0,0,85,115,101,32,111,102,32,34,100,111,34,32,116,111,32,99,97,108,108,32,115,117,98,114,111,117,116,105,110,101,115,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,114,97,119,0,0,0,0,0,85,110,98,97,108,97,110,99,101,100,32,115,97,118,101,115,58,32,37,108,100,32,109,111,114,101,32,115,97,118,101,115,32,116,104,97,110,32,114,101,115,116,111,114,101,115,10,0,112,97,110,105,99,58,32,112,97,100,95,115,119,105,112,101,32,99,117,114,112,97,100,44,32,37,112,33,61,37,112,0,105,95,97,100,100,0,0,0,77,105,115,115,105,110,103,32,99,111,109,109,97,110,100,32,105,110,32,112,105,112,101,100,32,111,112,101,110,0,0,0,48,48,48,0,0,0,0,0,84,89,80,69,0,0,0,0,117,116,102,56,58,58,117,112,103,114,97,100,101,0,0,0,83,99,97,108,97,114,0,0,118,101,99,116,111,114,32,97,114,103,117,109,101,110,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,119,105,116,104,32,97,108,112,104,97,32,118,101,114,115,105,111,110,115,0,0,0,0,0,0,0,58,0,0,0,0,0,0,0,78,82,69,70,0,0,0,0,99,104,114,111,111,116,0,0,112,97,110,105,99,58,32,104,118,95,112,108,97,99,101,104,111,108,100,101,114,115,95,112,0,0,0,0,0,0,0,0,32,40,99,104,97,110,103,101,32,46,104,32,116,111,32,46,112,104,32,109,97,121,98,101,63,41,32,40,100,105,100,32,121,111,117,32,114,117,110,32,104,50,112,104,63,41,0,0,85,78,75,78,79,87,78,45,109,105,99,114,111,112,101,114,108,0,0,0,0,0,0,0,70,111,114,109,97,116,32,37,45,112,32,114,101,100,101,102,105,110,101,100,0,0,0,0,37,115,32,109,101,116,104,111,100,32,34,37,45,50,53,54,112,34,32,111,118,101,114,108,111,97,100,105,110,103,32,34,37,115,34,32,105,110,32,112,97,99,107,97,103,101,32,34,37,51,112,34,0,0,0,0,67,97,110,110,111,116,32,99,111,110,118,101,114,116,32,97,32,114,101,102,101,114,101,110,99,101,32,116,111,32,37,115,32,116,111,32,116,121,112,101,103,108,111,98,0,0,0,0,97,100,100,0,0,0,0,0,95,0,0,0,0,0,0,0,76,73,83,84,0,0,0,0,117,116,102,56,58,58,100,101,99,111,100,101,0,0,0,0,65,114,114,97,121,32,108,101,110,103,116,104,0,0,0,0,82,69,70,70,65,0,0,0,102,99,104,100,105,114,0,0,46,104,0,0,0,0,0,0,63,63,63,0,0,0,0,0,114,101,112,101,97,116,0,0,37,48,42,100,0,0,0,0,112,97,110,105,99,58,32,115,119,97,115,104,95,102,101,116,99,104,32,103,111,116,32,115,119,97,116,99,104,32,111,102,32,117,110,101,120,112,101,99,116,101,100,32,98,105,116,32,119,105,100,116,104,44,32,115,108,101,110,61,37,108,117,44,32,110,101,101,100,101,110,116,115,61,37,108,117,0,0,0,117,116,102,56,58,58,101,110,99,111,100,101,0,0,0,0,123,36,58,43,45,64,0,0,82,69,70,70,85,0,0,0,99,104,100,105,114,0,0,0,67,97,110,39,116,32,108,111,99,97,116,101,32,37,115,32,105,110,32,64,73,78,67,37,115,37,115,32,40,64,73,78,67,32,99,111,110,116,97,105,110,115,58,37,45,112,41,0,112,97,110,105,99,58,32,110,111,32,97,100,100,114,101,115,115,32,102,111,114,32,39,37,115,39,32,105,110,32,39,37,115,39,0,0,0,0,0,0,111,118,101,114,108,111,97,100,0,0,0,0,0,0,0,0,105,95,109,111,100,117,108,111,0,0,0,0,0,0,0,0,37,48,42,100,95,37,100,0,67,111,100,101,32,112,111,105,110,116,32,48,120,37,48,52,108,88,32,105,115,32,110,111,116,32,85,110,105,99,111,100,101,44,32,97,108,108,32,92,112,123,125,32,109,97,116,99,104,101,115,32,102,97,105,108,59,32,97,108,108,32,92,80,123,125,32,109,97,116,99,104,101,115,32,115,117,99,99,101,101,100,0,0,0,0,0,0,117,116,102,56,58,58,118,97,108,105,100,0,0,0,0,0,33,61,126,32,115,104,111,117,108,100,32,98,101,32,33,126,0,0,0,0,0,0,0,0,105,110,116,101,114,110,97,108,32,37,37,60,110,117,109,62,112,32,109,105,103,104,116,32,99,111,110,102,108,105,99,116,32,119,105,116,104,32,102,117,116,117,114,101,32,112,114,105,110,116,102,32,101,120,116,101,110,115,105,111,110,115,0,0,82,69,70,70,76,0,0,0,85,115,101,32,111,102,32,99,104,100,105,114,40,39,39,41,32,111,114,32,99,104,100,105,114,40,117,110,100,101,102,41,32,97,115,32,99,104,100,105,114,40,41,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,0,0,32,10,45,0,0,0,0,0,37,115,58,37,108,100,45,37,108,100,0,0,0,0,0,0,110,105,108,0,0,0,0,0,109,111,100,117,108,111,0,0,37,100,46,0,0,0,0,0,66,73,84,83,0,0,0,0,117,116,102,56,58,58,105,115,95,117,116,102,56,0,0,0,82,101,118,101,114,115,101,100,32,37,99,61,32,111,112,101,114,97,116,111,114,0,0,0,46,0,0,0,0,0,0,0,82,69,70,70,0,0,0,0,76,79,71,68,73,82,0,0,67,97,110,39,116,32,108,111,99,97,116,101,32,37,115,58,32,32,32,37,115,0,0,0,78,111,32,37,115,32,97,108,108,111,119,101,100,32,119,105,116,104,32,40,115,117,105,100,41,32,102,100,115,99,114,105,112,116,0,0,0,0,0,0,108,118,97,108,117,101,32,97,116,116,114,105,98,117,116,101,32,105,103,110,111,114,101,100,32,97,102,116,101,114,32,116,104,101,32,115,117,98,114,111,117,116,105,110,101,32,104,97,115,32,98,101,101,110,32,100,101,102,105,110,101,100,0,0,112,97,110,105,99,58,32,103,112,95,102,114,101,101,32,102,97,105,108,101,100,32,116,111,32,102,114,101,101,32,103,108,111,98,32,112,111,105,110,116,101,114,32,45,32,115,111,109,101,116,104,105,110,103,32,105,115,32,114,101,112,101,97,116,101,100,108,121,32,114,101,45,99,114,101,97,116,105,110,103,32,101,110,116,114,105,101,115,0,0,0,0,0,0,0,0,37,108,120,0,0,0,0,0,105,95,100,105,118,105,100,101,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,111,98,106,101,99,116,0,0,112,97,110,105,99,58,32,115,119,97,115,104,95,102,101,116,99,104,32,103,111,116,32,105,109,112,114,111,112,101,114,32,115,119,97,116,99,104,44,32,115,118,112,61,37,112,44,32,116,109,112,115,61,37,112,44,32,115,108,101,110,61,37,108,117,44,32,110,101,101,100,101,110,116,115,61,37,108,117,0,118,101,114,115,105,111,110,58,58,105,115,95,113,118,0,0,43,45,42,47,37,46,94,38,124,60,0,0,0,0,0,0,67,97,110,39,116,32,98,108,101,115,115,32,110,111,110,45,114,101,102,101,114,101,110,99,101,32,118,97,108,117,101,0,72,79,77,69,0,0,0,0,112,114,111,103,114,97,109,32,105,110,112,117,116,32,102,114,111,109,32,115,116,100,105,110,0,0,0,0,0,0,0,0,82,117,110,97,119,97,121,32,112,114,111,116,111,116,121,112,101,0,0,0,0,0,0,0,65,116,116,101,109,112,116,32,116,111,32,102,114,101,101,32,117,110,114,101,102,101,114,101,110,99,101,100,32,103,108,111,98,32,112,111,105,110,116,101,114,115,0,0,0,0,0,0,100,105,118,105,100,101,0,0,86,101,114,115,105,111,110,32,115,116,114,105,110,103,32,39,37,115,39,32,99,111,110,116,97,105,110,115,32,105,110,118,97,108,105,100,32,100,97,116,97,59,32,105,103,110,111,114,105,110,103,58,32,39,37,115,39,0,0,0,0,0,0,0,112,97,110,105,99,58,32,104,118,95,115,116,111,114,101,40,41,32,117,110,101,120,112,101,99,116,101,100,108,121,32,102,97,105,108,101,100,0,0,0,118,101,114,115,105,111,110,58,58,100,101,99,108,97,114,101,0,0,0,0,0,0,0,0,85,78,75,78,79,87,78,0,67,76,79,83,69,0,0,0,112,97,110,105,99,58,32,100,111,95,116,114,97,110,115,95,99,111,109,112,108,101,120,32,108,105,110,101,32,37,100,0,111,112,101,110,0,0,0,0,47,100,101,118,47,110,117,108,108,0,0,0,0,0,0,0,109,97,105,110,58,58,70,0,37,45,112,58,58,95,71,69,78,95,37,108,100,0,0,0,68,69,83,84,82,85,67,84,0,0,0,0,0,0,0,0,101,118,97,108,98,121,116,101,115,0,0,0,0,0,0,0,105,95,109,117,108,116,105,112,108,121,0,0,0,0,0,0,99,104,117,110,107,0,0,0,37,46,57,102,0,0,0,0,85,83,69,82,95,68,69,70,73,78,69,68,0,0,0,0,118,101,114,115,105,111,110,58,58,113,118,0,0,0,0,0,85,110,109,97,116,99,104,101,100,32,114,105,103,104,116,32,99,117,114,108,121,32,98,114,97,99,107,101,116,0,0,0,82,69,71,69,88,80,0,0,79,80,69,78,0,0,0,0,37,115,32,40,117,110,101,120,112,101,99,116,101,100,32,110,111,110,45,99,111,110,116,105,110,117,97,116,105,111,110,32,98,121,116,101,32,48,120,37,48,50,120,44,32,105,109,109,101,100,105,97,116,101,108,121,32,97,102,116,101,114,32,115,116,97,114,116,32,98,121,116,101,32,48,120,37,48,50,120,41,0,0,0,0,0,0,0,45,84,32,97,110,100,32,45,66,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,32,111,110,32,102,105,108,101,104,97,110,100,108,101,115,0,0,0,0,0,0,0,0,73,78,67,0,0,0,0,0,85,115,97,103,101,58,32,105,110,118,111,99,97,110,116,45,62,68,79,69,83,40,107,105,110,100,41,0,0,0,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,111,99,116,97,108,32,110,117,109,98,101,114,0,0,0,0,0,0,0,0,78,97,109,101,32,34,37,50,112,58,58,37,50,112,34,32,117,115,101,100,32,111,110,108,121,32,111,110,99,101,58,32,112,111,115,115,105,98,108,101,32,116,121,112,111,0,0,0,109,117,108,116,105,112,108,121,0,0,0,0,0,0,0,0,48,0,0,0,0,0,0,0,73,78,86,76,73,83,84,0,118,101,114,115,105,111,110,58,58,105,115,95,97,108,112,104,97,0,0,0,0,0,0,0,112,97,110,105,99,58,32,85,110,101,120,112,101,99,116,101,100,32,70,76,65,71,83,32,37,117,32,105,110,32,111,112,32,37,117,0,0,0,0,0,40,91,123,60,32,41,93,125,62,32,41,93,125,62,0,0,66,73,78,68,0,0,0,0,87,72,73,76,69,77,0,0,115,116,97,116,0,0,0,0,47,108,111,97,100,101,114,47,48,120,37,108,120,47,37,115,0,0,0,0,0,0,0,0,97,32,115,121,109,98,111,108,0,0,0,0,0,0,0,0,37,115,91,37,115,58,37,108,100,93,0,0,0,0,0,0,95,95,65,78,79,78,95,95,58,58,0,0,0,0,0,0,69,79,76,0,0,0,0,0,83,111,114,116,32,115,117,98,114,111,117,116,105,110,101,32,100,105,100,110,39,116,32,114,101,116,117,114,110,32,115,105,110,103,108,101,32,118,97,108,117,101,0,0,0,0,0,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,115,116,114,105,110,103,32,105,110,32,112,97,99,107,0,0,0,0,0,0,0,0,0,0,67,97,110,39,116,32,114,101,116,117,114,110,32,37,115,32,116,111,32,108,118,97,108,117,101,32,115,99,97,108,97,114,32,99,111,110,116,101,120,116,0,0,0,0,0,0,0,0,112,111,119,0,0,0,0,0,118,0,0,0,0,0,0,0,83,87,65,83,72,78,69,87,32,100,105,100,110,39,116,32,114,101,116,117,114,110,32,97,110,32,72,86,32,114,101,102,0,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,110,111,111,112,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,0,0,0,0,73,79,0,0,0,0,0,0,37,48,42,46,42,102,0,0,67,85,82,76,89,88,0,0,84,104,101,32,115,116,97,116,32,112,114,101,99,101,100,105,110,103,32,108,115,116,97,116,40,41,32,119,97,115,110,39,116,32,97,110,32,108,115,116,97,116,0,0,0,0,0,0,65,116,116,101,109,112,116,32,116,111,32,114,101,108,111,97,100,32,37,115,32,97,98,111,114,116,101,100,46,10,67,111,109,112,105,108,97,116,105,111,110,32,102,97,105,108,101,100,32,105,110,32,114,101,113,117,105,114,101,0,0,0,0,0,78,111,116,32,97,32,71,76,79,66,32,114,101,102,101,114,101,110,99,101,0,0,0,0,47,117,110,107,110,111,119,110,0,0,0,0,0,0,0,0,34,109,121,32,115,117,98,34,32,110,111,116,32,121,101,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,85,78,73,84,67,72,69,67,75,0,0,0,0,0,0,0,99,114,108,102,0,0,0,0,85,110,98,97,108,97,110,99,101,100,32,115,99,111,112,101,115,58,32,37,108,100,32,109,111,114,101,32,69,78,84,69,82,115,32,116,104,97,110,32,76,69,65,86,69,115,10,0,37,45,112,32,110,101,118,101,114,32,105,110,116,114,111,100,117,99,101,100,0,0,0,0,105,95,112,111,115,116,100,101,99,0,0,0,0,0,0,0,118,105,110,102,0,0,0,0,67,97,110,39,116,32,102,105,110,100,32,85,110,105,99,111,100,101,32,112,114,111,112,101,114,116,121,32,100,101,102,105,110,105,116,105,111,110,32,34,37,45,112,34,0,0,0,0,118,101,114,115,105,111,110,58,58,40,110,111,109,101,116,104,111,100,0,0,0,0,0,0,85,110,107,110,111,119,110,32,111,112,101,110,40,41,32,109,111,100,101,32,39,37,46,42,115,39,0,0,0,0,0,0,85,110,109,97,116,99,104,101,100,32,114,105,103,104,116,32,115,113,117,97,114,101,32,98,114,97,99,107,101,116,0,0,70,79,82,77,65,84,0,0,67,85,82,76,89,77,0,0,108,115,116,97,116,40,41,32,111,110,32,102,105,108,101,104,97,110,100,108,101,37,115,37,45,112,0,0,0,0,0,0,112,97,110,105,99,58,32,104,118,32,110,97,109,101,32,116,111,111,32,108,111,110,103,32,40,37,108,117,41,0,0,0,114,101,113,117,105,114,101,0,95,95,65,78,79,78,73,79,95,95,0,0,0,0,0,0,47,53,46,49,54,46,51,0,112,111,115,116,100,101,99,0,111,114,105,103,105,110,97,108,0,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,97,98,115,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,97,116,116,114,105,98,117,116,101,32,108,105,115,116,0,0,0,0,0,71,76,79,66,0,0,0,0,67,85,82,76,89,78,0,0,115,111,99,107,101,116,112,97,105,114,0,0,0,0,0,0,78,117,108,108,32,102,105,108,101,110,97,109,101,32,117,115,101,100,0,0,0,0,0,0,78,111,116,32,97,110,32,117,110,98,108,101,115,115,101,100,32,65,82,82,65,89,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,0,47,53,46,49,54,46,51,47,117,110,107,110,111,119,110,0,110,111,110,101,0,0,0,0,28,0,0,0,0,0,0,0,83,84,79,82,69,83,73,90,69,0,0,0,0,0,0,0,67,79,82,69,58,58,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,0,118,97,108,117,101,115,32,111,110,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,107,101,121,115,32,111,110,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,105,95,112,111,115,116,105,110,99,0,0,0,0,0,0,0,101,97,99,104,32,111,110,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,118,46,73,110,102,0,0,0,83,87,65,83,72,78,69,87,0,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,47,61,0,0,0,0,117,110,107,110,111,119,110,32,99,117,115,116,111,109,32,111,112,101,114,97,116,111,114,0,73,110,118,97,108,105,100,32,115,101,112,97,114,97,116,111,114,32,99,104,97,114,97,99,116,101,114,32,37,99,37,99,37,99,32,105,110,32,97,116,116,114,105,98,117,116,101,32,108,105,115,116,0,0,0,0,67,79,68,69,0,0,0,0,67,85,82,76,89,0,0,0,67,104,97,114,97,99,116,101,114,32,105,110,32,39,37,99,39,32,102,111,114,109,97,116,32,119,114,97,112,112,101,100,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,101,110,100,103,114,101,110,116,0,0,0,0,0,0,0,0,102,108,111,99,107,40,41,0,80,101,114,108,32,37,45,112,32,114,101,113,117,105,114,101,100,32,40,100,105,100,32,121,111,117,32,109,101,97,110,32,37,45,112,63,41,45,45,116,104,105,115,32,105,115,32,111,110,108,121,32,37,45,112,44,32,115,116,111,112,112,101,100,0,0,0,0,0,0,0,0,78,111,116,32,97,110,32,65,82,82,65,89,32,114,101,102,101,114,101,110,99,101,0,0,115,101,116,103,114,101,110,116,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,114,101,115,116,97,114,116,111,112,32,105,110,32,99,97,108,108,95,108,105,115,116,10,0,0,40,37,45,112,41,0,0,0,103,101,116,103,114,101,110,116,0,0,0,0,0,0,0,0,103,101,116,103,114,103,105,100,0,0,0,0,0,0,0,0,103,101,116,103,114,110,97,109,0,0,0,0,0,0,0,0,101,110,100,112,119,101,110,116,0,0,0,0,0,0,0,0,115,101,116,112,119,101,110,116,0,0,0,0,0,0,0,0,103,101,116,112,119,101,110,116,0,0,0,0,0,0,0,0,112,111,115,116,105,110,99,0,103,101,116,112,119,117,105,100,0,0,0,0,0,0,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,118,101,114,115,105,111,110,0,0,0,0,0,117,116,102,56,0,0,0,0,118,101,114,115,105,111,110,58,58,40,42,61,0,0,0,0,103,101,116,112,119,110,97,109,0,0,0,0,0,0,0,0,109,101,116,104,111,100,0,0,72,65,83,72,0,0,0,0,80,76,85,83,0,0,0,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,115,116,114,105,110,103,32,105,110,32,39,37,99,39,32,102,111,114,109,97,116,32,105,110,32,117,110,112,97,99,107,0,101,110,100,115,101,114,118,101,110,116,0,0,0,0,0,0,102,99,110,116,108,32,105,115,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,0,118,37,100,46,37,100,46,48,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,117,110,107,110,111,119,110,32,79,65,95,42,58,32,37,120,0,101,110,100,112,114,111,116,111,101,110,116,0,0,0,0,0,32,118,115,32,0,0,0,0,36,37,99,32,105,115,32,110,111,32,108,111,110,103,101,114,32,115,117,112,112,111,114,116])
.concat([101,100,0,0,0,0,0,0,101,110,100,110,101,116,101,110,116,0,0,0,0,0,0,0,101,110,100,104,111,115,116,101,110,116,0,0,0,0,0,0,115,101,116,115,101,114,118,101,110,116,0,0,0,0,0,0,115,101,116,112,114,111,116,111,101,110,116,0,0,0,0,0,115,101,116,110,101,116,101,110,116,0,0,0,0,0,0,0,115,101,116,104,111,115,116,101,110,116,0,0,0,0,0,0,105,95,112,114,101,100,101,99,0,0,0,0,0,0,0,0,103,101,116,115,101,114,118,101,110,116,0,0,0,0,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,118,101,114,115,105,111,110,32,37,100,0,0,79,112,101,114,97,116,105,111,110,32,34,37,115,34,32,114,101,116,117,114,110,115,32,105,116,115,32,97,114,103,117,109,101,110,116,32,102,111,114,32,110,111,110,45,85,110,105,99,111,100,101,32,99,111,100,101,32,112,111,105,110,116,32,48,120,37,48,52,108,88,0,0,118,101,114,115,105,111,110,58,58,40,45,61,0,0,0,0,103,101,116,115,101,114,118,98,121,112,111,114,116,0,0,0,85,115,101,32,111,102,32,58,108,111,99,107,101,100,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,65,82,82,65,89,0,0,0,83,84,65,82,0,0,0,0,48,48,48,48,48,48,48,48,48,48,0,0,0,0,0,0,103,101,116,115,101,114,118,98,121,110,97,109,101,0,0,0,105,111,99,116,108,32,105,115,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,0,80,101,114,108,32,37,45,112,32,114,101,113,117,105,114,101,100,45,45,116,104,105,115,32,105,115,32,111,110,108,121,32,37,45,112,44,32,115,116,111,112,112,101,100,0,0,0,0,114,101,102,101,114,101,110,99,101,32,116,111,32,111,110,101,32,111,102,32,91,36,64,37,42,93,0,0,0,0,0,0,103,101,116,112,114,111,116,111,101,110,116,0,0,0,0,0,58,32,110,111,110,101,0,0,103,101,116,112,114,111,116,111,98,121,110,117,109,98,101,114,0,0,0,0,0,0,0,0,103,101,116,112,114,111,116,111,98,121,110,97,109,101,0,0,103,101,116,110,101,116,101,110,116,0,0,0,0,0,0,0,103,101,116,110,101,116,98,121,97,100,100,114,0,0,0,0,103,101,116,110,101,116,98,121,110,97,109,101,0,0,0,0,103,101,116,104,111,115,116,101,110,116,0,0,0,0,0,0,103,101,116,104,111,115,116,98,121,97,100,100,114,0,0,0,112,114,101,100,101,99,0,0,119,105,100,116,104,0,0,0,79,112,101,114,97,116,105,111,110,32,34,37,115,34,32,114,101,116,117,114,110,115,32,105,116,115,32,97,114,103,117,109,101,110,116,32,102,111,114,32,85,84,70,45,49,54,32,115,117,114,114,111,103,97,116,101,32,85,43,37,48,52,108,88,0,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,43,61,0,0,0,0,103,101,116,104,111,115,116,98,121,110,97,109,101,0,0,0,108,111,99,107,101,100,0,0,76,86,65,76,85,69,0,0,84,65,73,76,0,0,0,0,48,48,48,48,0,0,0,0,101,118,97,108,32,123,98,108,111,99,107,125,32,101,120,105,116,0,0,0,0,0,0,0,116,114,117,110,99,97,116,101,0,0,0,0,0,0,0,0,114,101,102,101,114,101,110,99,101,32,116,111,32,111,110,101,32,111,102,32,91,36,64,37,38,42,93,0,0,0,0,0,101,118,97,108,32,123,98,108,111,99,107,125,0,0,0,0,101,118,97,108,32,34,115,116,114,105,110,103,34,32,101,120,105,116,0,0,0,0,0,0,101,118,97,108,32,34,115,116,114,105,110,103,34,0,0,0,101,118,97,108,32,104,105,110,116,115,0,0,0,0,0,0,100,111,32,34,102,105,108,101,34,0,0,0,0,0,0,0,116,105,109,101,115,0,0,0,111,112,101,110,100,105,114,0,105,95,112,114,101,105,110,99,0,0,0,0,0,0,0,0,45,66,0,0,0,0,0,0,97,108,112,104,97,0,0,0,95,80,101,114,108,95,81,117,111,116,101,109,101,116,97,0,118,101,114,115,105,111,110,58,58,40,47,0,0,0,0,0,45,84,0,0,0,0,0,0,108,118,97,108,117,101,0,0,83,67,65,76,65,82,0,0,78,79,84,72,73,78,71,0,67,111,100,101,32,109,105,115,115,105,110,103,32,97,102,116,101,114,32,39,47,39,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,0,0,45,116,0,0,0,0,0,0,45,108,0,0,0,0,0,0,83,69,69,75,0,0,0,0,115,99,97,108,97,114,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,100,111,95,118,111,112,32,99,97,108,108,101,100,32,102,111,114,32,111,112,32,37,117,32,40,37,115,41,0,0,0,0,0,32,115,117,98,32,37,45,112,0,0,0,0,0,0,0,0,45,107,0,0,0,0,0,0,45,103,0,0,0,0,0,0,45,117,0,0,0,0,0,0,45,112,0,0,0,0,0,0,95,95,83,85,66,95,95,0,45,100,0,0,0,0,0,0,45,102,0,0,0,0,0,0,112,114,101,105,110,99,0,0,45,98,0,0,0,0,0,0,108,105,110,101,0,0,0,0,113,118,0,0,0,0,0,0,95,88,95,76,86,95,76,86,84,95,86,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,42,0,0,0,0,0,45,99,0,0,0,0,0,0,84,104,101,32,39,117,110,105,113,117,101,39,32,97,116,116,114,105,98,117,116,101,32,109,97,121,32,111,110,108,121,32,98,101,32,97,112,112,108,105,101,100,32,116,111,32,39,111,117,114,39,32,118,97,114,105,97,98,108,101,115,0,0,0,82,69,70,0,0,0,0,0,69,88,65,67,84,70,65,0,78,101,103,97,116,105,118,101,32,39,47,39,32,99,111,117,110,116,32,105,110,32,117,110,112,97,99,107,0,0,0,0,45,83,0,0,0,0,0,0,37,115,32,40,117,110,101,120,112,101,99,116,101,100,32,99,111,110,116,105,110,117,97,116,105,111,110,32,98,121,116,101,32,48,120,37,48,50,120,44,32,119,105,116,104,32,110,111,32,112,114,101,99,101,100,105,110,103,32,115,116,97,114,116,32,98,121,116,101,41,0,0,84,69,76,76,0,0,0,0,84,121,112,101,32,111,102,32,97,114,103,32,37,100,32,116,111,32,38,67,79,82,69,58,58,37,115,32,109,117,115,116,32,98,101,32,37,115,0,0,45,122,0,0,0,0,0,0,111,98,106,101,99,116,45,114,101,102,44,32,109,101,116,104,111,100,0,0,0,0,0,0,72,101,120,97,100,101,99,105,109,97,108,32,110,117,109,98,101,114,32,62,32,48,120,102,102,102,102,102,102,102,102,32,110,111,110,45,112,111,114,116,97,98,108,101,0,0,0,0,80,114,111,116,111,116,121,112,101,32,109,105,115,109,97,116,99,104,58,0,0,0,0,0,45,111,0,0,0,0,0,0,45,79,0,0,0,0,0,0,45,67,0,0,0,0,0,0,67,68,80,65,84,72,0,0,45,65,0,0,0,0,0,0,45,77,0,0,0,0,0,0,45,115,0,0,0,0,0,0,112,111,115,0,0,0,0,0,67,97,110,39,116,32,99,111,101,114,99,101,32,37,115,32,116,111,32,110,117,109,98,101,114,32,105,110,32,37,115,0,117,110,100,101,102,0,0,0,71,67,66,61,86,0,0,0,118,101,114,115,105,111,110,58,58,40,45,0,0,0,0,0,85,115,101,32,111,102,32,58,117,110,105,113,117,101,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,86,83,84,82,73,78,71,0,69,88,65,67,84,70,85,95,84,82,73,67,75,89,70,79,76,68,0,0,0,0,0,0,108,101,110,103,116,104,47,99,111,100,101,32,97,102,116,101,114,32,101,110,100,32,111,102,32,115,116,114,105,110,103,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,0,45,119,0,0,0,0,0,0,80,101,114,108,115,32,115,105,110,99,101,32,37,45,112,32,116,111,111,32,109,111,100,101,114,110,45,45,116,104,105,115,32,105,115,32,37,45,112,44,32,115,116,111,112,112,101,100,0,0,0,0,0,0,0,0,84,121,112,101,32,111,102,32,97,114,103,32,37,100,32,116,111,32,38,67,79,82,69,58,58,37,115,32,109,117,115,116,32,98,101,32,104,97,115,104,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,45,114,0,0,0,0,0,0,67,97,110,39,116,32,117,115,101,32,37,115,32,102,111,114,32,108,111,111,112,32,118,97,114,105,97,98,108,101,0,0,45,88,0,0,0,0,0,0,69,79,83,0,0,0,0,0,45,87,0,0,0,0,0,0,39,37,37,39,32,109,97,121,32,110,111,116,32,98,101,32,117,115,101,100,32,105,110,32,112,97,99,107,0,0,0,0,45,82,0,0,0,0,0,0,115,101,116,115,111,99,107,111,112,116,0,0,0,0,0,0,103,101,116,115,111,99,107,111,112,116,0,0,0,0,0,0,103,108,111,98,0,0,0,0,112,114,105,110,116,102,0,0,118,101,114,115,105,111,110,0,71,67,66,61,84,0,0,0,118,101,114,115,105,111,110,58,58,40,43,0,0,0,0,0,119,114,105,116,101,32,101,120,105,116,0,0,0,0,0,0,117,110,105,113,117,101,0,0,67,97,110,39,116,32,99,111,101,114,99,101,32,37,115,32,116,111,32,115,116,114,105,110,103,32,105,110,32,37,115,0,37,35,48,42,46,42,102,0,69,88,65,67,84,70,85,95,83,83,0,0,0,0,0,0,67,111,117,110,116,32,97,102,116,101,114,32,108,101,110,103,116,104,47,99,111,100,101,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,0,69,79,70,0,0,0,0,0,37,115,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,37,115,0,0,0,0,0,115,101,108,101,99,116,32,115,121,115,116,101,109,32,99,97,108,108,0,0,0,0,0,0,37,115,32,102,97,105,108,101,100,45,45,99,97,108,108,32,113,117,101,117,101,32,97,98,111,114,116,101,100,0,0,0,100,111,0,0,0,0,0,0,97,32,83,67,65,76,65,82,0,0,0,0,0,0,0,0,67,72,69,67,75,0,0,0,85,115,97,103,101,32,99,108,97,115,115,45,62,102,105,110,100,40,110,97,109,101,91,44,108,111,97,100,93,41,0,0,108,101,97,118,101,32,119,104,101,110,32,98,108,111,99,107,0,0,0,0,0,0,0,0,119,104,101,110,40,41,0,0,109,97,105,110,58,58,0,0,108,101,97,118,101,32,103,105,118,101,110,32,98,108,111,99,107,0,0,0,0,0,0,0,103,105,118,101,110,40,41,0,109,101,116,104,111,100,32,119,105,116,104,32,107,110,111,119,110,32,110,97,109,101,0,0,67,97,110,39,116,32,117,115,101,32,103,108,111,98,97,108,32,37,46,42,115,32,105,110,32,34,37,115,34,0,0,0,108,111,111,112,32,101,120,105,116,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,100,111,116,116,101,100,45,100,101,99,105,109,97,108,32,118,101,114,115,105,111,110,115,32,109,117,115,116,32,98,101,103,105,110,32,119,105,116,104,32,39,118,39,41,0,0,0,0,71,67,66,61,76,86,84,0,118,101,114,115,105,111,110,58,58,98,111,111,108,101,97,110,0,0,0,0,0,0,0,0,108,111,111,112,32,101,110,116,114,121,0,0,0,0,0,0,102,111,114,101,97,99,104,32,108,111,111,112,32,105,116,101,114,97,116,111,114,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,97,116,116,114,105,98,117,116,101,32,112,97,114,97,109,101,116,101,114,32,105,110,32,97,116,116,114,105,98,117,116,101,32,108,105,115,116,0,0,0,0,0,0,67,97,110,39,116,32,99,111,101,114,99,101,32,114,101,97,100,111,110,108,121,32,37,115,32,116,111,32,115,116,114,105,110,103,0,0,0,0,0,0,67,97,110,39,116,32,99,97,108,108,32,109,114,111,95,105,115,97,95,99,104,97,110,103,101,100,95,105,110,40,41,32,111,110,32,97,110,111,110,121,109,111,117,115,32,115,121,109,98,111,108,32,116,97,98,108,101,0,0,0,0,0,0,0,69,88,65,67,84,70,85,0,99,67,115,83,105,73,108,76,110,78,85,87,118,86,113,81,106,74,0,0,0,0,0,0,66,97,100,32,104,97,115,104,0,0,0,0,0,0,0,0,95,60,40,37,46,49,48,115,95,101,118,97,108,32,37,108,117,41,0,0,0,0,0,0,84,111,111,32,109,97,110,121,0,0,0,0,0,0,0,0,102,111,114,101,97,99,104,32,108,111,111,112,32,101,110,116,114,121,0,0,0,0,0,0,66,69,71,73,78,32,102,97,105,108,101,100,45,45,99,111,109,112,105,108,97,116,105,111,110,32,97,98,111,114,116,101,100,0,0,0,0,0,0,0,98,108,111,99,107,0,0,0,66,97,100,32,115,121,109,98,111,108,32,102,111,114,32,37,115,0,0,0,0,0,0,0,98,108,111,99,107,32,101,120,105,116,0,0,0,0,0,0,98,108,111,99,107,32,101,110,116,114,121,0,0,0,0,0,105,116,101,114,97,116,105,111,110,32,102,105,110,97,108,105,122,101,114,0,0,0,0,0,100,101,98,117,103,32,110,101,120,116,32,115,116,97,116,101,109,101,110,116,0,0,0,0,110,101,120,116,32,115,116,97,116,101,109,101,110,116,0,0,100,101,102,105,110,101,100,0,108,105,110,101,32,115,101,113,117,101,110,99,101,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,102,114,97,99,116,105,111,110,97,108,32,112,97,114,116,32,114,101,113,117,105,114,101,100,41,0,0,0,0,0,0,0,71,67,66,61,76,86,0,0,118,101,114,115,105,111,110,58,58,40,98,111,111,108,0,0,115,121,109,98,111,108,32,114,101,115,101,116,0,0,0,0,85,115,101,32,111,102,32,58,61,32,102,111,114,32,97,110,32,101,109,112,116,121,32,97,116,116,114,105,98,117,116,101,32,108,105,115,116,32,105,115,32,110,111,116,32,97,108,108,111,119,101,100,0,0,0,0,67,97,110,39,116,32,99,111,101,114,99,101,32,114,101,97,100,111,110,108,121,32,37,115,32,116,111,32,115,116,114,105,110,103,32,105,110,32,37,115,0,0,0,0,0,0,0,0,69,88,65,67,84,70,76,0,102,70,100,68,0,0,0,0,108,118,97,108,117,101,32,115,117,98,114,111,117,116,105,110,101,32,114,101,116,117,114,110,0,0,0,0,0,0,0,0,87,82,73,84,69,0,0,0,95,60,40,37,46,49,48,115,101,118,97,108,32,37,108,117,41,91,37,115,58,37,108,100,93,0,0,0,0,0,0,0,78,111,116,32,101,110,111,117,103,104,0,0,0,0,0,0,115,117,98,114,111,117,116,105,110,101,32,101,120,105,116,0,117,110,105,109,112,111,114,116,0,0,0,0,0,0,0,0,109,101,116,104,111,100,32,108,111,111,107,117,112,0,0,0,83,72,73,70,84,0,0,0,100,101,102,105,110,101,100,32,111,114,32,97,115,115,105,103,110,109,101,110,116,32,40,47,47,61,41,0,0,0,0,0,108,111,103,105,99,97,108,32,111,114,32,97,115,115,105,103,110,109,101,110,116,32,40,124,124,61,41,0,0,0,0,0,108,111,103,105,99,97,108,32,97,110,100,32,97,115,115,105,103,110,109,101,110,116,32,40,38,38,61,41,0,0,0,0,99,111,110,100,105,116,105,111,110,97,108,32,101,120,112,114,101,115,115,105,111,110,0,0,115,99,104,111,109,112,0,0,100,101,102,105,110,101,100,32,111,114,32,40,47,47,41,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,109,105,115,112,108,97,99,101,100,32,117,110,100,101,114,115,99,111,114,101,41,0,0,0,71,67,66,61,76,0,0,0,118,101,114,115,105,111,110,58,58,118,99,109,112,0,0,0,108,111,103,105,99,97,108,32,120,111,114,0,0,0,0,0,20,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,99,114,101,97,116,101,32,115,117,98,32,110,97,109,101,100,32,34,37,45,112,34,0,0,0,0,0,0,0,0,69,88,65,67,84,70,0,0,39,80,39,32,109,117,115,116,32,104,97,118,101,32,97,110,32,101,120,112,108,105,99,105,116,32,115,105,122,101,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,0,0,108,111,103,105,99,97,108,32,111,114,32,40,124,124,41,0,79,102,102,115,101,116,32,111,117,116,115,105,100,101,32,115,116,114,105,110,103,0,0,0,85,115,101,32,111,102,32,34,103,111,116,111,34,32,116,111,32,106,117,109,112,32,105,110,116,111,32,97,32,99,111,110,115,116,114,117,99,116,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,112,97,110,105,99,58,32,117,110,105,109,112,108,101,109,101,110,116,101,100,32,111,112,32,37,115,32,40,35,37,100,41,32,99,97,108,108,101,100,0,108,111,103,105,99,97,108,32,97,110,100,32,40,38,38,41,0,0,0,0,0,0,0,0,68,66,58,58,115,105,103,110,97,108,0,0,0,0,0,0,105,109,112,111,114,116,0,0,114,97,110,103,101,32,40,111,114,32,102,108,111,112,41,0,114,97,110,103,101,32,40,111,114,32,102,108,105,112,41,0,102,108,105,112,102,108,111,112,0,0,0,0,0,0,0,0,109,97,112,32,105,116,101,114,97,116,111,114,0,0,0,0,109,97,112,0,0,0,0,0,103,114,101,112,32,105,116,101,114,97,116,111,114,0,0,0,99,104,111,109,112,0,0,0,103,114,101,112,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,97,108,112,104,97,32,119,105,116,104,111,117,116,32,100,101,99,105,109,97,108,41,0,0,72,83,84,61,78,111,116,95,65,112,112,108,105,99,97,98,108,101,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,60,61,62,0,0,0,97,110,111,110,121,109,111,117,115,32,104,97,115,104,32,40,123,125,41,0,0,0,0,0,61,62,0,0,0,0,0,0,78,111,116,32,97,32,115,117,98,114,111,117,116,105,110,101,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,69,88,65,67,84,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,99,111,109,112,114,101,115,115,101,100,32,105,110,116,101,103,101,114,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,0,97,110,111,110,121,109,111,117,115,32,108,105,115,116,32,40,91,93,41,0,0,0,0,0,78,101,103,97,116,105,118,101,32,108,101,110,103,116,104,0,79,100,100,32,110,117,109,98,101,114,32,111,102,32,101,108,101,109,101,110,116,115,32,105,110,32,104,97,115,104,32,97,115,115,105,103,110,109,101,110,116,0,0,0,0,0,0,0,67,97,110,39,116,32,34,103,111,116,111,34,32,105,110,116,111,32,116,104,101,32,109,105,100,100,108,101,32,111,102,32,97,32,102,111,114,101,97,99,104,32,108,111,111,112,0,0,91,111,117,116,32,111,102,32,114,97,110,103,101,93,0,0,108,105,115,116,32,115,108,105,99,101,0,0,0,0,0,0,68,66,58,58,116,114,97,99,101,0,0,0,0,0,0,0,86,101,114,115,105,111,110,32,110,117,109,98,101,114,32,109,117,115,116,32,98,101,32,97,32,99,111,110,115,116,97,110,116,32,110,117,109,98,101,114,0,0,0,0,0,0,0,0,83,73,71,37,115,32,104,97,110,100,108,101,114,32,34,37,115,34,32,110,111,116,32,100,101,102,105,110,101,100,46,10,0,0,0,0,0,0,0,0,106,111,105,110,32,111,114,32,115,116,114,105,110,103,0,0,104,97,115,104,32,115,108,105,99,101,0,0,0,0,0,0,104,97,115,104,32,101,108,101,109,101,110,116,0,0,0,0,67,79,78,83,84,82,85,67,84,0,0,0,0,0,0,0,104,97,115,104,32,100,101,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,0,118,97,108,117,101,115,32,111,110,32,97,114,114,97,121,0,107,101,121,115,32,111,110,32,97,114,114,97,121,0,0,0,101,97,99,104,32,111,110,32,97,114,114,97,121,0,0,0,115,99,104,111,112,0,0,0,97,114,114,97,121,32,115,108,105,99,101,0,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,110,111,110,45,110,117,109,101,114,105,99,32,100,97,116,97,41,0,0,0,0,0,0,0,71,67,66,61,80,114,101,112,101,110,100,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,99,109,112,0,0,0,97,114,114,97,121,32,101,108,101,109,101,110,116,0,0,0,112,97,110,105,99,58,32,105,110,112,117,116,32,111,118,101,114,102,108,111,119,44,32,37,112,32,62,32,37,112,0,0,66,97,100,32,102,105,108,101,104,97,110,100,108,101,58,32,37,45,112,0,0,0,0,0,66,65,67,75,0,0,0,0,37,46,42,108,117,0,0,0,99,111,110,115,116,97,110,116,32,108,101,120,105,99,97,108,32,97,114,114,97,121,32,101,108,101,109,101,110,116,0,0,82,69,65,68,0,0,0,0,82,101,102,101,114,101,110,99,101,32,102,111,117,110,100,32,119,104,101,114,101,32,101,118,101,110,45,115,105,122,101,100,32,108,105,115,116,32,101,120,112,101,99,116,101,100,0,0,67,97,110,39,116,32,102,105,110,100,32,108,97,98,101,108,32,37,45,112,0,0,0,0,83,112,108,105,116,32,108,111,111,112,0,0,0,0,0,0,99,111,110,115,116,97,110,116,32,97,114,114,97,121,32,101,108,101,109,101,110,116,0,0,68,66,58,58,115,105,110,103,108,101,0,0,0,0,0,0,77,111,100,117,108,101,32,110,97,109,101,32,109,117,115,116,32,98,101,32,99,111,110,115,116,97,110,116,0,0,0,0,83,105,103,110,97,108,32,83,73,71,37,115,32,114,101,99,101,105,118,101,100,44,32,98,117,116,32,110,111,32,115,105,103,110,97,108,32,104,97,110,100,108,101,114,32,115,101,116,46,10,0,0,0,0,0,0,97,114,114,97,121,32,100,101,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,115,109,97,114,116,32,109,97,116,99,104,0,0,0,0,0,49,39,115,32,99,111,109,112,108,101,109,101,110,116,32,40,126,41,0,0,0,0,0,0,105,110,116,101,103,101,114,32,110,101,103,97,116,105,111,110,32,40,45,41,0,0,0,0,110,101,103,97,116,105,111,110,32,40,45,41,0,0,0,0,98,105,116,119,105,115,101,32,111,114,32,40,124,41,0,0,99,104,111,112,0,0,0,0,98,105,116,119,105,115,101,32,120,111,114,32,40,94,41,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,118,101,114,115,105,111,110,32,114,101,113,117,105,114,101,100,41,0,0,0,0,0,0,0,95,88,95,69,120,116,101,110,100,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,110,111,114,109,97,108,0,98,105,116,119,105,115,101,32,97,110,100,32,40,38,41,0,84,111,111,32,108,97,116,101,32,102,111,114,32,34,45,37,46,42,115,34,32,111,112,116,105,111,110,0,0,0,0,0,66,82,65,78,67,72,0,0,85,48,32,109,111,100,101,32,111,110,32,97,32,98,121,116,101,32,115,116,114,105,110,103,0,0,0,0,0,0,0,0,115,116,114,105,110,103,32,99,111,109,112,97,114,105,115,111,110,32,40,99,109,112,41,0,80,82,73,78,84,70,0,0,68,79,69,83,0,0,0,0,112,97,110,105,99,58,32,103,111,116,111,44,32,116,121,112,101,61,37,117,44,32,105,120,61,37,108,100,0,0,0,0,112,97,110,105,99,58,32,112,112,95,115,112,108,105,116,44,32,112,109,61,37,112,44,32,115,61,37,112,0,0,0,0,115,116,114,105,110,103,32,110,101,0,0,0,0,0,0,0,68,66,58,58,115,117,98,0,115,116,114,105,110,103,32,101,113,0,0,0,0,0,0,0,67,97,110,39,116,32,101,120,101,99,32,34,37,115,34,58,32,37,115,0,0,0,0,0,115,116,114,105,110,103,32,103,101,0,0,0,0,0,0,0,115,116,114,105,110,103,32,108,101,0,0,0,0,0,0,0,115,116,114,105,110,103,32,103,116,0,0,0,0,0,0,0,115,116,114,105,110,103,32,108,116,0,0,0,0,0,0,0,105,110,116,101,103,101,114,32,99,111,109,112,97,114,105,115,111,110,32,40,60,61,62,41,0,0,0,0,0,0,0,0,97,97,115,115,105,103,110,0,110,117,109,101,114,105,99,32,99,111,109,112,97,114,105,115,111,110,32,40,60,61,62,41,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,110,101,103,97,116,105,118,101,32,118,101,114,115,105,111,110,32,110,117,109,98,101,114,41,0,0,0,0,0,0,0,0,95,88,95,66,101,103,105,110,0,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,110,117,109,105,102,121,0,105,110,116,101,103,101,114,32,110,101,32,40,33,61,41,0,67,97,110,39,116,32,101,120,101,99,32,37,115,0,0,0,66,97,100,32,102,105,108,101,104,97,110,100,108,101,58,32,37,50,112,0,0,0,0,0,67,76,85,77,80,0,0,0,39,47,39,32,109,117,115,116,32,102,111,108,108,111,119,32,97,32,110,117,109,101,114,105,99,32,116,121,112,101,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,0,0,110,117,109,101,114,105,99,32,110,101,32,40,33,61,41,0,112,97,103,101,32,111,118,101,114,102,108,111,119,0,0,0,67,97,110,39,116,32,34,103,111,116,111,34,32,111,117,116,32,111,102,32,97,32,112,115,101,117,100,111,32,98,108,111,99,107,0,0,0,0,0,0,85,78,83,72,73,70,84,0,105,110,116,101,103,101,114,32,101,113,32,40,61,61,41,0,68,66,58,58,100,98,108,105,110,101,0,0,0,0,0,0,38,96,39,49,50,51,52,53,54,55,56,57,43,45,14,18,0,0,0,0,0,0,0,0,73,71,0,0,0,0,0,0,78,101,103,97,116,105,118,101,32,111,102,102,115,101,116,32,116,111,32,118,101,99,32,105,110,32,108,118,97,108,117,101,32,99,111,110,116,101,120,116,0,0,0,0,0,0,0,0,110,117,109,101,114,105,99,32,101,113,32,40,61,61,41,0,105,110,116,101,103,101,114,32,103,101,32,40,62,61,41,0,110,117,109,101,114,105,99,32,103,101,32,40,62,61,41,0,37,115,0,0,0,0,0,0,82,85,78,0,0,0,0,0,105,110,116,101,103,101,114,32,108,101,32,40,60,61,41,0,101,108,115,101,105,102,32,115,104,111,117,108,100,32,98,101,32,101,108,115,105,102,0,0,110,117,109,101,114,105,99,32,108,101,32,40,60,61,41,0,105,110,116,101,103,101,114,32,103,116,32,40,62,41,0,0,115,97,115,115,105,103,110,0,110,117,109,101,114,105,99,32,103,116,32,40,62,41,0,0,44,32,60,37,45,112,62,32,37,115,32,37,108,100,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,48,32,98,101,102,111,114,101,32,100,101,99,105,109,97,108,32,114,101,113,117,105,114,101,100,41,0,0,0,0,0,0,73,115,77,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,48,43,0,0,0,0,105,110,116,101,103,101,114,32,108,116,32,40,60,41,0,0,105,110,100,105,114,0,0,0,115,101,109,105,45,112,97,110,105,99,58,32,97,116,116,101,109,112,116,32,116,111,32,100,117,112,32,102,114,101,101,100,32,115,116,114,105,110,103,0,78,68,73,71,73,84,65,0,39,120,39,32,111,117,116,115,105,100,101,32,111,102,32,115,116,114,105,110,103,32,105,110,32,117,110,112,97,99,107,0,37,115,32,40,101,109,112,116,121,32,115,116,114,105,110,103,41,0,0,0,0,0,0,0,110,117,109,101,114,105,99,32,108,116,32,40,60,41,0,0,85,110,100,101,102,105,110,101,100,32,116,111,112,32,102,111,114,109,97,116,32,99,97,108,108,101,100,0,0,0,0,0,67,97,110,39,116,32,99,97,108,108,32,109,101,116,104,111,100,32,34,37,45,112,34,32,111,110,32,117,110,98,108,101,115,115,101,100,32,114,101,102,101,114,101,110,99,101,0,0,68,66,58,58,103,111,116,111,0,0,0,0,0,0,0,0,80,85,83,72,0,0,0,0,114,105,103,104,116,32,98,105,116,115,104,105,102,116,32,40,62,62,41,0,0,0,0,0,68,66,58,58,68,66,0,0,114,101,102,101,114,101,110,99,101,44,32,107,105,110,100,0,73,108,108,101,103,97,108,32,104,101,120,97,100,101,99,105,109,97,108,32,100,105,103,105,116,32,39,37,99,39,32,105,103,110,111,114,101,100,0,0,114,101,102,108,97,103,115,95,99,104,97,114,115,101,116,0,115,101,116,101,103,105,100,40,41,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,82,71,86,79,85,84,0,0,108,101,102,116,32,98,105,116,115,104,105,102,116,32,40,60,60,41,0,0,0,0,0,0,115,116,114,105,110,103,0,0,99,111,110,99,97,116,101,110,97,116,105,111,110,32,40,46,41,32,111,114,32,115,116,114,105,110,103,0,0,0,0,0,73,70,83,0,0,0,0,0,105,110,116,101,103,101,114,32,115,117,98,116,114,97,99,116,105,111,110,32,40,45,41,0,115,117,98,116,114,97,99,116,105,111,110,32,40,45,41,0,105,110,116,101,103,101,114,32,97,100,100,105,116,105,111,110,32,40,43,41,0,0,0,0,116,114,97,110,115,114,0,0,67,97,110,39,116,32,99,111,101,114,99,101,32,37,115,32,116,111,32,105,110,116,101,103,101,114,32,105,110,32,37,115,0,0,0,0,0,0,0,0,97,100,100,105,116,105,111,110,32,40,43,41,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,117,110,100,101,114,115,99,111,114,101,115,32,98,101,102,111,114,101,32,100,101,99,105,109,97,108,41,0,0,0,0,0,112,97,110,105,99,58,32,108,101,97,118,101,95,115,99,111,112,101,32,105,110,99,111,110,115,105,115,116,101,110,99,121,32,37,117,0,0,0,0,0,118,101,114,115,105,111,110,58,58,115,116,114,105,110,103,105,102,121,0,0,0,0,0,0,114,101,112,101,97,116,32,40,120,41,0,0,0,0,0,0,112,101,114,108,0,0,0,0,76,111,115,116,32,112,114,101,99,105,115,105,111,110,32,119,104,101,110,32,100,101,99,114,101,109,101,110,116,105,110,103,32,37,102,32,98,121,32,49,0,0,0,0,0,0,0,0,78,68,73,71,73,84,76,0,39,88,39,32,111,117,116,115,105,100,101,32,111,102,32,115,116,114,105,110,103,32,105,110,32,117,110,112,97,99,107,0,105,110,116,101,103,101,114,32,109,111,100,117,108,117,115,32,40,37,41,0,0,0,0,0,85,110,100,101,102,105,110,101,100,32,116,111,112,32,102,111,114,109,97,116,32,34,37,45,112,34,32,99,97,108,108,101,100,0,0,0,0,0,0,0,111,110,32,97,110,32,117,110,100,101,102,105,110,101,100,32,118,97,108,117,101,0,0,0,67,97,110,39,116,32,103,111,116,111,32,115,117,98,114,111,117,116,105,110,101,32,102,114,111,109,32,97,32,115,111,114,116,32,115,117,98,32,40,111,114,32,115,105,109,105,108,97,114,32,99,97,108,108,98,97,99,107,41,0,0,0,0,0,115,112,108,105,99,101,40,41,32,111,102,102,115,101,116,32,112,97,115,116,32,101,110,100,32,111,102,32,97,114,114,97,121,0,0,0,0,0,0,0,109,111,100,117,108,117,115,32,40,37,41,0,0,0,0,0,67,97,110,110,111,116,32,115,101,116,32,116,105,101,100,32,64,68,66,58,58,97,114,103,115,0,0,0,0,0,0,0,114,101,102,108,97,103,115,0,115,101,116,114,103,105,100,40,41,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,82,71,86,0,0,0,0,0,105,110,116,101,103,101,114,32,100,105,118,105,115,105,111,110,32,40,47,41,0,0,0,0,83,66,79,76,0,0,0,0,98,0,0,0,0,0,0,0,100,105,118,105,115,105,111,110,32,40,47,41,0,0,0,0,73,110,118,97,108,105,100,32,116,121,112,101,32,39,37,99,39,32,105,110,32,112,97,99,107,0,0,0,0,0,0,0,85,84,70,45,49,54,32,115,117,114,114,111,103,97,116,101,32,85,43,37,48,52,108,88,0,0,0,0,0,0,0,0,105,110,116,101,103,101,114,32,109,117,108,116,105,112,108,105,99,97,116,105,111,110,32,40,42,41,0,0,0,0,0,0,109,117,108,116,105,112,108,105,99,97,116,105,111,110,32,40,42,41,0,0,0,0,0,0,101,120,112,111,110,101,110,116,105,97,116,105,111,110,32,40,42,42,41,0,0,0,0,0,105,110,116,101,103,101,114,32,112,111,115,116,100,101,99,114,101,109,101,110,116,32,40,45,45,41,0,0,0,0,0,0,78,111,116,32,37,115,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,0,116,114,97,110,115,0,0,0,112,111,115,116,100,101,99,114,101,109,101,110,116,32,40,45,45,41,0,0,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,109,117,108,116,105,112,108,101,32,117,110,100,101,114,115,99,111,114,101,115,41,0,0,0,118,101,114,115,105,111,110,58,58,40,34,34,0,0,0,0,105,110,116,101,103,101,114,32,112,111,115,116,105,110,99,114,101,109,101,110,116,32,40,43,43,41,0,0,0,0,0,0,112,101,114,108,32,45,0,0,76,111,115,116,32,112,114,101,99,105,115,105,111,110,32,119,104,101,110,32,105,110,99,114,101,109,101,110,116,105,110,103,32,37,102,32,98,121,32,49,0,0,0,0,0,0,0,0,78,111,116,32,101,110,111,117,103,104,32,102,111,114,109,97,116,32,97,114,103,117,109,101,110,116,115,0,0,0,0,0,78,68,73,71,73,84,0,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,115,116,114,105,110,103,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,0,0,0,112,111,115,116,105,110,99,114,101,109,101,110,116,32,40,43,43,41,0,0,0,0,0,0,98,97,100,32,116,111,112,32,102,111,114,109,97,116,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,0,0,119,105,116,104,111,117,116,32,97,32,112,97,99,107,97,103,101,32,111,114,32,111,98,106,101,99,116,32,114,101,102,101,114,101,110,99,101,0,0,0,67,97,110,39,116,32,103,111,116,111,32,115,117,98,114,111,117,116,105,110,101,32,102,114,111,109,32,97,110,32,101,118,97,108,45,98,108,111,99,107,0,0,0,0,0,0,0,0,83,80,76,73,67,69,0,0,105,110,116,101,103,101,114,32,112,114,101,100,101,99,114,101,109,101,110,116,32,40,45,45,41,0,0,0,0,0,0,0,68,66,58,58,97,114,103,115,0,0,0,0,0,0,0,0,39,37,115,39,32,116,114,97,112,112,101,100,32,98,121,32,111,112,101,114,97,116,105,111,110,32,109,97,115,107,0,0,115,101,116,101,117,105,100,40,41,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,69,82,83,73,79,78,0,0,112,114,101,100,101,99,114,101,109,101,110,116,32,40,45,45,41,0,0,0,0,0,0,0,78,111,116,32,97,32,83,67,65,76,65,82,32,114,101,102,101,114,101,110,99,101,0,0,73,78,73,84,0,0,0,0,77,111,114,101,32,116,104,97,110,32,111,110,101,32,97,114,103,117,109,101,110,116,32,116,111,32,111,112,101,110,0,0,124,116,114,32,45,115,32,39,32,9,12,13,39,32,39,92,48,49,50,92,48,49,50,92,48,49,50,92,48,49,50,39,124,0,0,0,0,0,0,0,105,110,116,101,103,101,114,32,112,114,101,105,110,99,114,101,109,101,110,116,32,40,43,43,41,0,0,0,0,0,0,0,112,114,101,105,110,99,114,101,109,101,110,116,32,40,43,43,41,0,0,0,0,0,0,0,117,110,107,110,111,119,110,0,105,115,97,0,0,0,0,0,112,97,110,105,99,58,32,112,97,100,95,102,105,110,100,109,121,95,112,118,110,32,105,108,108,101,103,97,108,32,102,108,97,103,32,98,105,116,115,32,48,120,37,108,120,0,0,0,109,97,116,99,104,32,112,111,115,105,116,105,111,110,0,0,117,110,100,101,102,32,111,112,101,114,97,116,111,114,0,0,100,101,102,105,110,101,100,32,111,112,101,114,97,116,111,114,0,0,0,0,0,0,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,98,105,110,97,114,121,32,110,117,109,98,101,114,0,0,0,0,0,0,0,115,117,98,115,116,99,111,110,116,0,0,0,0,0,0,0,112,114,105,110,116,32,39,72,101,108,108,111,32,87,111,114,108,100,39,0,0,0,0,0,115,99,97,108,97,114,32,99,104,111,109,112,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,110,111,32,117,110,100,101,114,115,99,111,114,101,115,41,0,118,101,114,115,105,111,110,58,58,112,97,114,115,101,0,0,115,99,97,108,97,114,32,99,104,111,112,0,0,0,0,0,61,99,117,116,0,0,0,0,87,105,100,101,32,99,104,97,114,97,99,116,101,114,32,105,110,32,36,47,0,0,0,0,112,97,110,105,99,58,32,109,97,103,105,99,95,108,101,110,58,32,37,108,100,0,0,0,85,78,73,86,69,82,83,65,76,0,0,0,0,0,0,0,68,73,71,73,84,65,0,0,39,64,39,32,111,117,116,115,105,100,101,32,111,102,32,115,116,114,105,110,103,32,119,105,116,104,32,109,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,105,110,32,117,110,112,97,99,107,0,0,0,0,108,105,115,116,32,97,115,115,105,103,110,109,101,110,116,0,116,111,112,0,0,0,0,0,65,116,116,101,109,112,116,32,116,111,32,100,101,108,101,116,101,32,114,101,97,100,111,110,108,121,32,107,101,121,32,39,37,45,112,39,32,102,114,111,109,32,97,32,114,101,115,116,114,105,99,116,101,100,32,104,97,115,104,0,0,0,0,0,67,97,110,39,116,32,99,97,108,108,32,109,101,116,104,111,100,32,34,37,45,112,34,32,37,115,0,0,0,0,0,0,67,97,110,39,116,32,103,111,116,111,32,115,117,98,114,111,117,116,105,110,101,32,102,114,111,109,32,97,110,32,101,118,97,108,45,115,116,114,105,110,103,0,0,0,0,0,0,0,79,100,100,32,110,117,109,98,101,114,32,111,102,32,101,108,101,109,101,110,116,115,32,105,110,32,97,110,111,110,121,109,111,117,115,32,104,97,115,104,0,0,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,115,119,105,116,99,104,58,32,45,37,46,49,115,32,32,40,45,104,32,119,105,108,108,32,115,104,111,119,32,118,97,108,105,100,32,111,112,116,105,111,110,115,41,0,0,0,0,0,0,0,0,115,99,97,108,97,114,32,97,115,115,105,103,110,109,101,110,116,0,0,0,0,0,0,0,115,101,116,114,117,105,100,40,41,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,86,69,82,76,79,65,68,0,116,114,97,110,115,108,105,116,101,114,97,116,105,111,110,32,40,116,114,47,47,47,41,0,101,99,104,111,32,0,0,0,115,117,98,115,116,105,116,117,116,105,111,110,32,105,116,101,114,97,116,111,114,0,0,0,115,117,98,115,116,105,116,117,116,105,111,110,32,40,115,47,47,47,41,0,0,0,0,0,112,97,116,116,101,114,110,32,113,117,111,116,101,32,40,113,114,47,47,41,0,0,0,0,112,97,116,116,101,114,110,32,109,97,116,99,104,32,40,109,47,47,41,0,0,0,0,0,114,101,103,101,120,112,32,99,111,109,112,105,108,97,116,105,111,110,0,0,0,0,0,0,115,117,98,115,116,0,0,0,114,101,103,101,120,112,32,105,110,116,101,114,110,97,108,32,114,101,115,101,116,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,109,97,120,105,109,117,109,32,51,32,100,105,103,105,116,115,32,98,101,116,119,101,101,110,32,100,101,99,105,109,97,108,115,41,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,110,101,119,0,0,0,0,114,101,103,101,120,112,32,105,110,116,101,114,110,97,108,32,103,117,97,114,100,0,0,0,10,10,0,0,0,0,0,0,68,73,71,73,84,76,0,0,39,64,39,32,111,117,116,115,105,100,101,32,111,102,32,115,116,114,105,110,103,32,105,110,32,117,110,112,97,99,107,0,97,112,112,101,110,100,32,73,47,79,32,111,112,101,114,97,116,111,114,0,0,0,0,0,37,50,112,95,84,79,80,0,67,97,110,39,116,32,99,97,108,108,32,109,101,116,104,111,100,32,34,37,45,112,34,32,111,110,32,97,110,32,117,110,100,101,102,105,110,101,100,32,118,97,108,117,101,0,0,0,67,97,110,39,116,32,103,111,116,111,32,115,117,98,114,111,117,116,105,110,101,32,111,117,116,115,105,100,101,32,97,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,112,97,110,105,99,58,32,97,118,104,118,95,100,101,108,101,116,101,32,110,111,32,108,111,110,103,101,114,32,115,117,112,112,111,114,116,101,100,0,0,67,97,110,39,116,32,101,109,117,108,97,116,101,32,45,37,46,49,115,32,111,110,32,35,33,32,108,105,110,101,0,0,60,72,65,78,68,76,69,62,0,0,0,0,0,0,0,0,65,115,115,105,103,110,105,110,103,32,110,111,110,45,122,101,114,111,32,116,111,32,36,91,32,105,115,32,110,111,32,108,111,110,103,101,114,32,112,111,115,115,105,98,108,101,0,0,83,65,0,0,0,0,0,0,113,117,111,116,101,100,32,101,120,101,99,117,116,105,111,110,32,40,96,96,44,32,113,120,41,0,0,0,0,0,0,0,102,99,104,109,111,100,0,0,114,101,102,101,114,101,110,99,101,45,116,121,112,101,32,111,112,101,114,97,116,111,114,0,115,105,110,103,108,101,32,114,101,102,32,99,111,110,115,116,114,117,99,116,111,114,0,0,114,101,102,101,114,101,110,99,101,32,99,111,110,115,116,114,117,99,116,111,114,0,0,0,115,117,98,114,111,117,116,105,110,101,32,112,114,111,116,111,116,121,112,101,0,0,0,0,97,110,111,110,121,109,111,117,115,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,115,117,98,114,111,117,116,105,110,101,32,100,101,114,101,102,101,114,101,110,99,101,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,110,111,32,108,101,97,100,105,110,103,32,122,101,114,111,115,41,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,58,40,41,0,0,0,0,0])
.concat([97,114,114,97,121,32,108,101,110,103,116,104,0,0,0,0,111,117,114,32,64,70,61,115,112,108,105,116,40,39,32,39,41,59,0,0,0,0,0,0,68,73,71,73,84,0,0,0,73,110,118,97,108,105,100,32,116,121,112,101,32,39,37,99,39,32,105,110,32,117,110,112,97,99,107,0,0,0,0,0,115,99,97,108,97,114,32,100,101,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,78,111,116,32,97,32,102,111,114,109,97,116,32,114,101,102,101,114,101,110,99,101,0,0,85,115,101,32,111,102,32,114,101,102,101,114,101,110,99,101,32,34,37,45,112,34,32,97,115,32,97,114,114,97,121,32,105,110,100,101,120,0,0,0,71,111,116,111,32,117,110,100,101,102,105,110,101,100,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,0,78,111,116,32,97,32,72,65,83,72,32,114,101,102,101,114,101,110,99,101,0,0,0,0,34,45,37,99,34,32,105,115,32,111,110,32,116,104,101,32,35,33,32,108,105,110,101,44,32,105,116,32,109,117,115,116,32,97,108,115,111,32,98,101,32,117,115,101,100,32,111,110,32,116,104,101,32,99,111,109,109,97,110,100,32,108,105,110,101,37,115,0,0,0,0,0,114,101,102,45,116,111,45,103,108,111,98,32,99,97,115,116,0,0,0,0,0,0,0,0,80,97,114,101,110,116,104,101,115,101,115,32,109,105,115,115,105,110,103,32,97,114,111,117,110,100,32,34,37,115,34,32,108,105,115,116,0,0,0,0,88,80,79,82,84,0,0,0,112,117,115,104,32,114,101,103,101,120,112,0,0,0,0,0,112,114,105,118,97,116,101,32,118,97,108,117,101,0,0,0,112,114,105,118,97,116,101,32,104,97,115,104,0,0,0,0,112,114,105,118,97,116,101,32,97,114,114,97,121,0,0,0,112,114,105,118,97,116,101,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,0,0,103,108,111,98,32,101,108,101,109,0,0,0,0,0,0,0,109,97,116,99,104,0,0,0,103,108,111,98,32,118,97,108,117,101,0,0,0,0,0,0,73,110,118,97,108,105,100,32,118,101,114,115,105,111,110,32,102,111,114,109,97,116,32,40,100,111,116,116,101,100,45,100,101,99,105,109,97,108,32,118,101,114,115,105,111,110,115,32,114,101,113,117,105,114,101,32,97,116,32,108,101,97,115,116,32,116,104,114,101,101,32,112,97,114,116,115,41,0,0,0,85,78,73,86,69,82,83,65,76,58,58,86,69,82,83,73,79,78,0,0,0,0,0,0,41,59,0,0,0,0,0,0,115,99,97,108,97,114,32,118,97,114,105,97,98,108,101,0,115,118,95,112,111,115,95,98,50,117,0,0,0,0,0,0,78,83,80,65,67,69,65,0,78,111,32,103,114,111,117,112,32,101,110,100,105,110,103,32,99,104,97,114,97,99,116,101,114,32,39,37,99,39,32,102,111,117,110,100,32,105,110,32,116,101,109,112,108,97,116,101,0,0,0,0,0,0,0,0,99,111,110,115,116,97,110,116,32,105,116,101,109,0,0,0,76,101,120,105,110,103,32,99,111,100,101,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,40,37,115,41,0,85,110,100,101,102,105,110,101,100,32,102,111,114,109,97,116,32,34,37,45,112,34,32,99,97,108,108,101,100,0,0,0,68,101,101,112,32,114,101,99,117,114,115,105,111,110,32,111,110,32,115,117,98,114,111,117,116,105,110,101,32,34,37,45,112,34,0,0,0,0,0,0,71,111,116,111,32,117,110,100,101,102,105,110,101,100,32,115,117,98,114,111,117,116,105,110,101,32,38,37,45,112,0,0,67,97,110,39,116,32,109,111,100,105,102,121,32,37,115,32,105,110,32,37,115,0,0,0,77,105,115,115,105,110,103,32,97,114,103,117,109,101,110,116,32,116,111,32,45,37,99,0,110,117,108,108,32,111,112,101,114,97,116,105,111,110,0,0,64,36,37,42,0,0,0,0,97,115,115,105,103,110,105,110,103,32,116,111,32,36,94,79,0,0,0,0,0,0,0,0,72,97,100,32,116,111,32,99,114,101,97,116,101,32,37,45,112,32,117,110,101,120,112,101,99,116,101,100,108,121,0,0,102,99,0,0,0,0,0,0,32,119,104,105,108,101,32,114,117,110,110,105,110,103,32,115,101,116,117,105,100,0,0,0,115,104,0,0,0,0,0,0,114,117,110,99,118,0,0,0,99,111,114,101,97,114,103,115,0,0,0,0,0,0,0,0,114,118,97,108,117,101,115,0,114,107,101,121,115,0,0,0,114,101,97,99,104,0,0,0,99,117,115,116,111,109,0,0,73,115,68,105,103,105,116,0,85,78,73,86,69,82,83,65,76,58,58,68,79,69,83,0,111,117,114,32,64,70,61,115,112,108,105,116,40,113,0,0,111,110,99,101,0,0,0,0,112,97,110,105,99,58,32,115,118,95,112,111,115,95,98,50,117,58,32,98,97,100,32,98,121,116,101,32,111,102,102,115,101,116,44,32,98,108,101,110,61,37,108,117,44,32,98,121,116,101,61,37,108,117,0,0,78,83,80,65,67,69,85,0,112,97,99,107,47,117,110,112,97,99,107,32,114,101,112,101,97,116,32,99,111,117,110,116,32,111,118,101,114,102,108,111,119,0,0,0,0,0,0,0,108,111,99,107,0,0,0,0,68,101,101,112,32,114,101,99,117,114,115,105,111,110,32,111,110,32,97,110,111,110,121,109,111,117,115,32,115,117,98,114,111,117,116,105,110,101,0,0,76,97,98,101,108,32,110,111,116,32,102,111,117,110,100,32,102,111,114,32,34,114,101,100,111,32,37,45,112,34,0,0,84,121,112,101,32,111,102,32,97,114,103,117,109,101,110,116,32,116,111,32,37,115,32,109,117,115,116,32,98,101,32,117,110,98,108,101,115,115,101,100,32,104,97,115,104,114,101,102,32,111,114,32,97,114,114,97,121,114,101,102,0,0,0,0,0,41,0,0,0,0,0,0,44,32,9,10,0,0,0,0,36,38,42,40,41,123,125,91,93,39,34,59,92,124,63,60,62,126,96,10,0,0,0,0,101,103,114,101,110,116,0,0,115,103,114,101,110,116,0,0,103,103,114,101,110,116,0,0,103,103,114,103,105,100,0,0,103,103,114,110,97,109,0,0,114,101,103,99,114,101,115,101,116,0,0,0,0,0,0,0,101,112,119,101,110,116,0,0,9,40,65,114,101,32,121,111,117,32,116,114,121,105,110,103,32,116,111,32,99,97,108,108,32,37,115,37,115,32,111,110,32,100,105,114,104,97,110,100,108,101,37,115,37,45,112,63,41,10,0,0,0,0,0,0,73,115,88,80,101,114,108,83,112,97,99,101,0,0,0,0,85,78,73,86,69,82,83,65,76,58,58,99,97,110,0,0,111,117,114,32,64,70,61,115,112,108,105,116,40,37,115,41,59,0,0,0,0,0,0,0,115,112,119,101,110,116,0,0,115,118,95,108,101,110,95,117,116,102,56,0,0,0,0,0,78,83,80,65,67,69,76,0,39,88,39,32,111,117,116,115,105,100,101,32,111,102,32,115,116,114,105,110,103,32,105,110,32,37,115,0,0,0,0,0,103,112,119,101,110,116,0,0,71,69,84,67,0,0,0,0,67,97,110,39,116,32,109,111,100,105,102,121,32,110,111,110,45,108,118,97,108,117,101,32,115,117,98,114,111,117,116,105,110,101,32,99,97,108,108,0,67,97,110,39,116,32,34,114,101,100,111,34,32,111,117,116,115,105,100,101,32,97,32,108,111,111,112,32,98,108,111,99,107,0,0,0,0,0,0,0,32,115,112,108,105,116,40,47,44,47,44,113,0,0,0,0,103,112,119,117,105,100,0,0,103,112,119,110,97,109,0,0,101,115,101,114,118,101,110,116,0,0,0,0,0,0,0,0,101,112,114,111,116,111,101,110,116,0,0,0,0,0,0,0,101,110,101,116,101,110,116,0,101,104,111,115,116,101,110,116,0,0,0,0,0,0,0,0,115,115,101,114,118,101,110,116,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,114,101,103,99,109,97,121,98,101,0,0,0,0,0,0,0,115,112,114,111,116,111,101,110,116,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,85,78,73,86,69,82,83,65,76,58,58,105,115,97,0,0,99,104,111,109,112,59,0,0,115,110,101,116,101,110,116,0,65,116,116,101,109,112,116,32,116,111,32,102,114,101,101,32,117,110,114,101,102,101,114,101,110,99,101,100,32,115,99,97,108,97,114,58,32,83,86,32,48,120,37,108,120,0,0,0,112,97,110,105,99,33,32,73,110,32,116,114,105,101,32,99,111,110,115,116,114,117,99,116,105,111,110,44,32,110,111,32,99,104,97,114,32,109,97,112,112,105,110,103,32,102,111,114,32,37,108,100,0,0,0,0,78,83,80,65,67,69,0,0,87,105,116,104,105,110,32,91,93,45,108,101,110,103,116,104,32,39,37,99,39,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,32,37,115,0,115,104,111,115,116,101,110,116,0,0,0,0,0,0,0,0,115,101,108,101,99,116,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,78,111,32,68,66,58,58,115,117,98,32,114,111,117,116,105,110,101,32,100,101,102,105,110,101,100,0,0,0,0,0,0,76,97,98,101,108,32,110,111,116,32,102,111,117,110,100,32,102,111,114,32,34,110,101,120,116,32,37,45,112,34,0,0,101,114,114,111,114,32,99,114,101,97,116,105,110,103,47,102,101,116,99,104,105,110,103,32,119,105,100,101,99,104,97,114,109,97,112,32,101,110,116,114,121,32,102,111,114,32,48,120,37,108,88,0,0,0,0,0,32,40,41,0,0,0,0,0,103,115,101,114,118,101,110,116,0,0,0,0,0,0,0,0,85,115,105,110,103,32,33,126,32,119,105,116,104,32,116,114,47,47,47,114,32,100,111,101,115,110,39,116,32,109,97,107,101,32,115,101,110,115,101,0,65,116,116,101,109,112,116,32,116,111,32,115,101,116,32,108,101,110,103,116,104,32,111,102,32,102,114,101,101,100,32,97,114,114,97,121,0,0,0,0,112,97,110,105,99,33,32,73,110,32,116,114,105,101,32,99,111,110,115,116,114,117,99,116,105,111,110,44,32,117,110,107,110,111,119,110,32,110,111,100,101,32,116,121,112,101,32,37,117,32,37,115,0,0,0,0,97,114,121,98,97,115,101,0,103,115,98,121,112,111,114,116,0,0,0,0,0,0,0,0,67,97,110,39,116,32,117,112,103,114,97,100,101,32,37,115,32,40,37,108,117,41,32,116,111,32,37,108,117,0,0,0,73,108,108,101,103,97,108,32,110,117,109,98,101,114,32,111,102,32,98,105,116,115,32,105,110,32,118,101,99,0,0,0,103,115,98,121,110,97,109,101,0,0,0,0,0,0,0,0,76,111,111,107,98,101,104,105,110,100,32,108,111,110,103,101,114,32,116,104,97,110,32,37,108,117,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,32,105,110,32,114,101,103,101,120,32,109,47,37,46,42,115,37,115,47,0,0,0,103,112,114,111,116,111,101,110,116,0,0,0,0,0,0,0,86,97,114,105,97,98,108,101,32,108,101,110,103,116,104,32,108,111,111,107,98,101,104,105,110,100,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,103,112,98,121,110,117,109,98,101,114,0,0,0,0,0,0,81,117,97,110,116,105,102,105,101,114,32,117,110,101,120,112,101,99,116,101,100,32,111,110,32,122,101,114,111,45,108,101,110,103,116,104,32,101,120,112,114,101,115,115,105,111,110,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,0,115,116,97,116,101,0,0,0,103,112,98,121,110,97,109,101,0,0,0,0,0,0,0,0,18,69,95,84,82,73,69,95,77,65,88,66,85,70,0,0,103,110,101,116,101,110,116,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,114,99,97,116,108,105,110,101,0,0,0,0,0,0,0,0,32,97,116,32,37,115,32,108,105,110,101,32,37,108,100,0,103,110,98,121,97,100,100,114,0,0,0,0,0,0,0,0,37,115,37,115,32,111,110,32,37,115,32,37,115,37,115,37,45,112,0,0,0,0,0,0,112,97,110,105,99,58,32,73,110,99,111,114,114,101,99,116,32,118,101,114,115,105,111,110,32,102,111,114,32,112,114,101,118,105,111,117,115,108,121,32,103,101,110,101,114,97,116,101,100,32,105,110,118,101,114,115,105,111,110,32,108,105,115,116,0,0,0,0,0,0,0,0,76,73,78,69,58,32,119,104,105,108,101,32,40,60,62,41,32,123,0,0,0,0,0,0,103,110,98,121,110,97,109,101,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,114,101,102,101,114,101,110,99,101,32,109,105,115,99,111,117,110,116,32,111,110,32,110,115,118,32,105,110,32,115,118,95,114,101,112,108,97,99,101,40,41,32,40,37,108,117,32,33,61,32,49,41,0,0,0,0,0,112,97,110,105,99,58,32,97,116,116,101,109,112,116,105,110,103,32,116,111,32,97,112,112,101,110,100,32,116,111,32,97,110,32,105,110,118,101,114,115,105,111,110,32,108,105,115,116,44,32,98,117,116,32,119,97,115,110,39,116,32,97,116,32,116,104,101,32,101,110,100,32,111,102,32,116,104,101,32,108,105,115,116,44,32,102,105,110,97,108,61,37,108,117,44,32,115,116,97,114,116,61,37,108,117,44,32,109,97,116,99,104,61,37,99,0,0,0,0,0,112,97,110,105,99,58,32,112,97,100,32,111,102,102,115,101,116,32,37,108,117,32,111,117,116,32,111,102,32,114,97,110,103,101,32,40,37,112,45,37,112,41,0,0,0,0,0,0,83,80,65,67,69,65,0,0,73,110,118,97,108,105,100,32,116,121,112,101,32,39,37,99,39,32,105,110,32,37,115,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,99,104,97,114,97,99,116,101,114,0,0,0,0,0,0,0,103,104,111,115,116,101,110,116,0,0,0,0,0,0,0,0,78,111,32,100,98,109,32,111,110,32,116,104,105,115,32,109,97,99,104,105,110,101,0,0,68,66,58,58,108,115,117,98,0,0,0,0,0,0,0,0,67,97,110,39,116,32,34,110,101,120,116,34,32,111,117,116,115,105,100,101,32,97,32,108,111,111,112,32,98,108,111,99,107,0,0,0,0,0,0,0,84,104,101,32,99,114,121,112,116,40,41,32,102,117,110,99,116,105,111,110,32,105,115,32,117,110,105,109,112,108,101,109,101,110,116,101,100,32,100,117,101,32,116,111,32,101,120,99,101,115,115,105,118,101,32,112,97,114,97,110,111,105,97,46,0,0,0,0,0,0,0,0,67,97,110,39,116,32,117,115,101,32,39,37,99,39,32,97,102,116,101,114,32,45,109,110,97,109,101,0,0,0,0,0,85,115,97,103,101,58,32,67,79,68,69,40,48,120,37,108,120,41,40,37,115,41,0,0,103,104,98,121,97,100,100,114,0,0,0,0,0,0,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,104,101,120,97,100,101,99,105,109,97,108,32,110,117,109,98,101,114,0,0,85,115,105,110,103,32,33,126,32,119,105,116,104,32,115,47,47,47,114,32,100,111,101,115,110,39,116,32,109,97,107,101,32,115,101,110,115,101,0,0,112,97,110,105,99,58,32,114,101,103,95,110,111,100,101,32,111,118,101,114,114,117,110,32,116,114,121,105,110,103,32,116,111,32,101,109,105,116,32,37,100,44,32,37,112,62,61,37,112,0,0,0,0,0,0,0,84,105,101,58,58,72,97,115,104,58,58,78,97,109,101,100,67,97,112,116,117,114,101,0,103,104,98,121,110,97,109,101,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,98,97,100,32,102,108,97,103,32,37,108,120,32,105,110,32,114,101,103,95,115,99,97,110,95,110,97,109,101,0,0,0,0,85,115,101,32,111,102,32,45,108,32,111,110,32,102,105,108,101,104,97,110,100,108,101,32,37,50,112,0,0,0,0,0,78,85,76,76,32,114,101,103,101,120,112,32,112,97,114,97,109,101,116,101,114,0,0,0,108,101,97,118,101,116,114,121,0,0,0,0,0,0,0,0,82,101,102,101,114,101,110,99,101,32,116,111,32,110,111,110,101,120,105,115,116,101,110,116,32,110,97,109,101,100,32,103,114,111,117,112,0,0,0,0,101,110,116,101,114,116,114,121,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,110,111,32,115,118,110,97,109,101,32,105,110,32,114,101,103,95,115,99,97,110,95,110,97,109,101,0,0,0,0,0,0,0,32,119,104,105,108,101,32,114,117,110,110,105,110,103,32,119,105,116,104,32,45,84,32,115,119,105,116,99,104,0,0,0,108,101,97,118,101,101,118,97,108,0,0,0,0,0,0,0,80,79,83,73,88,32,115,121,110,116,97,120,32,91,37,99,32,37,99,93,32,98,101,108,111,110,103,115,32,105,110,115,105,100,101,32,99,104,97,114,97,99,116,101,114,32,99,108,97,115,115,101,115,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,0,0,0,80,79,83,73,88,32,115,121,110,116,97,120,32,91,37,99,32,37,99,93,32,105,115,32,114,101,115,101,114,118,101,100,32,102,111,114,32,102,117,116,117,114,101,32,101,120,116,101,110,115,105,111,110,115,0,0,104,105,110,116,115,101,118,97,108,0,0,0,0,0,0,0,80,79,83,73,88,32,99,108,97,115,115,32,91,58,37,46,42,115,58,93,32,117,110,107,110,111,119,110,0,0,0,0,112,97,110,105,99,58,32,115,118,95,117,112,103,114,97,100,101,32,116,111,32,117,110,107,110,111,119,110,32,116,121,112,101,32,37,108,117,0,0,0,100,111,102,105,108,101,0,0,102,105,108,101,104,97,110,100,108,101,0,0,0,0,0,0,112,97,110,105,99,58,32,108,101,97,118,101,95,115,99,111,112,101,32,112,97,100,32,99,111,100,101,0,0,0,0,0,120,100,105,103,105,116,0,0,78,85,76,76,32,97,114,114,97,121,32,101,108,101,109,101,110,116,32,105,110,32,114,101,58,58,114,101,103,110,97,109,101,115,40,41,0,0,0,0,117,115,101,32,102,101,97,116,117,114,101,32,39,58,53,46,49,54,39,59,0,0,0,0,112,97,110,105,99,58,32,115,118,95,105,110,115,101,114,116,44,32,109,105,100,101,110,100,61,37,112,44,32,98,105,103,101,110,100,61,37,112,0,0,112,117,110,99,0,0,0,0,83,80,65,67,69,85,0,0,87,105,116,104,105,110,32,91,93,45,108,101,110,103,116,104,32,39,42,39,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,32,37,115,0,0,115,101,109,99,116,108,0,0,65,110,121,68,66,77,95,70,105,108,101,46,112,109,0,0,85,110,100,101,102,105,110,101,100,32,115,117,98,114,111,117,116,105,110,101,32,38,37,45,112,32,99,97,108,108,101,100,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,108,97,115,116,44,32,116,121,112,101,61,37,117,0,0,0,0,112,114,105,110,0,0,0,0,115,117,98,115,116,114,32,111,117,116,115,105,100,101,32,111,102,32,115,116,114,105,110,103,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,109,111,100,117,108,101,32,110,97,109,101,32,37,46,42,115,32,119,105,116,104,32,45,37,99,32,111,112,116,105,111,110,58,32,99,111,110,116,97,105,110,115,32,115,105,110,103,108,101,32,39,58,39,0,0,0,115,101,109,103,101,116,0,0,65,112,112,108,121,105,110,103,32,37,115,32,116,111,32,37,115,32,119,105,108,108,32,97,99,116,32,111,110,32,115,99,97,108,97,114,40,37,115,41,0,0,0,0,0,0,0,0,100,105,103,105,0,0,0,0,115,101,109,111,112,0,0,0,77,66,79,76,0,0,0,0,117,112,112,101,0,0,0,0,109,115,103,114,99,118,0,0,97,65,90,0,0,0,0,0,108,111,119,101,0,0,0,0,109,115,103,115,110,100,0,0,97,108,110,117,0,0,0,0,109,115,103,99,116,108,0,0,99,110,116,114,0,0,0,0,109,115,103,103,101,116,0,0,114,116,0,0,0,0,0,0,98,108,97,110,0,0,0,0,115,104,109,119,114,105,116,101,0,0,0,0,0,0,0,0,97,115,99,105,0,0,0,0,115,104,109,114,101,97,100,0,115,111,99,107,101,116,0,0,103,114,97,112,0,0,0,0,95,80,101,114,108,95,73,68,83,116,97,114,116,0,0,0,91,97,108,108,93,0,0,0,66,69,71,73,78,32,123,32,114,101,113,117,105,114,101,32,39,112,101,114,108,53,100,98,46,112,108,39,32,125,59,0,115,104,109,99,116,108,0,0,67,97,110,39,116,32,109,111,100,105,102,121,32,110,111,110,101,120,105,115,116,101,110,116,32,115,117,98,115,116,114,105,110,103,0,0,0,0,0,0,115,112,97,99,0,0,0,0,83,80,65,67,69,76,0,0,39,47,39,32,100,111,101,115,32,110,111,116,32,116,97,107,101,32,97,32,114,101,112,101,97,116,32,99,111,117,110,116,32,105,110,32,37,115,0,0,115,104,109,103,101,116,0,0,65,110,121,68,66,77,95,70,105,108,101,0,0,0,0,0,85,110,100,101,102,105,110,101,100,32,115,117,98,114,111,117,116,105,110,101,32,99,97,108,108,101,100,0,0,0,0,0,76,97,98,101,108,32,110,111,116,32,102,111,117,110,100,32,102,111,114,32,34,108,97,115,116,32,37,45,112,34,0,0,97,108,112,104,0,0,0,0,65,116,116,101,109,112,116,32,116,111,32,117,115,101,32,114,101,102,101,114,101,110,99,101,32,97,115,32,108,118,97,108,117,101,32,105,110,32,115,117,98,115,116,114,0,0,0,0,77,111,100,117,108,101,32,110,97,109,101,32,114,101,113,117,105,114,101,100,32,119,105,116,104,32,45,37,99,32,111,112,116,105,111,110,0,0,0,0,115,108,101,101,112,0,0,0,37,104,97,115,104,0,0,0,70,73,82,83,84,75,69,89,0,0,0,0,0,0,0,0,119,111,114,100,0,0,0,0,69,114,114,110,111,0,0,0,67,97,110,110,111,116,32,97,112,112,108,121,32,34,37,115,34,32,105,110,32,110,111,110,45,80,101,114,108,73,79,32,112,101,114,108,0,0,0,0,80,101,114,108,32,102,111,108,100,105,110,103,32,114,117,108,101,115,32,97,114,101,32,110,111,116,32,117,112,45,116,111,45,100,97,116,101,32,102,111,114,32,48,120,37,120,59,32,112,108,101,97,115,101,32,117,115,101,32,116,104,101,32,112,101,114,108,98,117,103,32,117,116,105,108,105,116,121,32,116,111,32,114,101,112,111,114,116,59,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,115,115,0,0,0,0,0,0,118,53,46,49,54,46,48,0,38,0,0,0,0,0,0,0,116,109,115,0,0,0,0,0,116,105,109,101,0,0,0,0,112,97,110,105,99,58,32,105,110,118,97,108,105,100,32,80,76,95,117,116,102,56,95,102,111,108,100,99,108,111,115,117,114,101,115,32,115,116,114,117,99,116,117,114,101,0,0,0,115,101,116,112,114,105,111,114,105,116,121,0,0,0,0,0,200,128,0,0,0,0,0,0,103,101,116,112,114,105,111,114,105,116,121,0,0,0,0,0,119,114,105,116,101,0,0,0,73,110,118,97,108,105,100,32,91,93,32,114,97,110,103,101,32,34,37,42,46,42,115,34,0,0,0,0,0,0,0,0,110,97,109,101,91,44,32,97,108,108,32,93,0,0,0,0,80,69,82,76,53,68,66,0,115,101,116,112,103,114,112,0,112,97,110,105,99,58,32,109,97,103,105,99,95,107,105,108,108,98,97,99,107,114,101,102,115,32,40,102,108,97,103,115,61,37,108,120,41,0,0,0,65,84,67,72,0,0,0,0,73,110,118,97,108,105,100,32,91,58,58,93,32,99,108,97,115,115,0,0,0,0,0,0,112,97,110,105,99,58,32,105,110,118,97,108,105,100,32,77,82,79,33,0,0,0,0,0,83,80,65,67,69,0,0,0,77,97,108,102,111,114,109,101,100,32,105,110,116,101,103,101,114,32,105,110,32,91,93,32,105,110,32,37,115,0,0,0,103,101,116,112,103,114,112,0,117,110,116,105,101,32,97,116,116,101,109,112,116,101,100,32,119,104,105,108,101,32,37,108,117,32,105,110,110,101,114,32,114,101,102,101,114,101,110,99,101,115,32,115,116,105,108,108,32,101,120,105,115,116,0,0,37,108,100,47,37,108,100,0,67,108,111,115,117,114,101,32,112,114,111,116,111,116,121,112,101,32,99,97,108,108,101,100,0,0,0,0,0,0,0,0,67,97,110,39,116,32,34,108,97,115,116,34,32,111,117,116,115,105,100,101,32,97,32,108,111,111,112,32,98,108,111,99,107,0,0,0,0,0,0,0,88,80,111,115,105,120,87,111,114,100,0,0,0,0,0,0,32,110,111,32,0,0,0,0,64,97,114,114,97,121,0,0,78,69,88,84,75,69,89,0,88,80,111,115,105,120,85,112,112,101,114,0,0,0,0,0,33,0,0,0,0,0,0,0,67,97,110,39,116,32,111,112,101,110,32,97,32,114,101,102,101,114,101,110,99,101,0,0,107,105,108,108,0,0,0,0,88,80,111,115,105,120,80,117,110,99,116,0,0,0,0,0,88,80,111,115,105,120,80,114,105,110,116,0,0,0,0,0,88,80,111,115,105,120,76,111,119,101,114,0,0,0,0,0,119,97,105,116,112,105,100,0,67,97,115,101,100,0,0,0,119,97,105,116,0,0,0,0,88,80,111,115,105,120,71,114,97,112,104,0,0,0,0,0,102,111,114,107,0,0,0,0,88,80,111,115,105,120,68,105,103,105,116,0,0,0,0,0,98,108,101,115,115,0,0,0,99,108,111,115,101,100,105,114,0,0,0,0,0,0,0,0,114,101,97,100,108,105,110,101,0,0,0,0,0,0,0,0,88,80,111,115,105,120,65,108,112,104,97,0,0,0,0,0,73,110,116,101,114,110,97,108,115,58,58,72,118,82,69,72,65,83,72,32,36,104,97,115,104,114,101,102,0,0,0,0,77,105,115,115,105,110,103,32,114,105,103,104,116,32,99,117,114,108,121,32,111,114,32,115,113,117,97,114,101,32,98,114,97,99,107,101,116,0,0,0,112,97,110,105,99,58,32,109,97,103,105,99,95,107,105,108,108,98,97,99,107,114,101,102,115,32,40,102,114,101,101,100,32,98,97,99,107,114,101,102,32,65,86,47,83,86,41,0,33,117,116,102,56,58,58,37,115,10,0,0,0,0,0,0,78,65,76,78,85,77,65,0,68,117,112,108,105,99,97,116,101,32,109,111,100,105,102,105,101,114,32,39,37,99,39,32,97,102,116,101,114,32,39,37,99,39,32,105,110,32,37,115,0,0,0,0,0,0,0,0,85,78,84,73,69,0,0,0,112,97,110,105,99,58,32,114,101,116,117,114,110,44,32,116,121,112,101,61,37,117,0,0,88,80,111,115,105,120,65,108,110,117,109,0,0,0,0,0,36,36,0,0,0,0,0,0,67,97,110,39,116,32,116,97,107,101,32,37,115,32,111,102,32,37,103,0,0,0,0,0,117,115,101,32,0,0,0,0,65,112,112,108,121,105,110,103,32,37,115,32,116,111,32,37,45,112,32,119,105,108,108,32,97,99,116,32,111,110,32,115,99,97,108,97,114,40,37,45,112,41,0,0,0,0,0,0,67,76,69,65,82,0,0,0,43,117,116,102,56,58,58,37,115,10,0,0,0,0,0,0,60,110,111,110,101,62,58,58,0,0,0,0,0,0,0,0,114,101,97,100,100,105,114,0,70,97,108,115,101,32,91,93,32,114,97,110,103,101,32,34,37,42,46,42,115,34,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,0,0,80,79,80,0,0,0,0,0,111,112,101,110,95,100,105,114,0,0,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,101,115,99,97,112,101,32,92,37,99,32,105,110,32,99,104,97,114,97,99,116,101,114,32,99,108,97,115,115,32,112,97,115,115,101,100,32,116,104,114,111,117,103,104,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,37,99,117,116,102,56,58,58,37,115,10,0,0,0,0,0,114,101,97,100,108,105,110,107,0,0,0,0,0,0,0,0,115,121,109,108,105,110,107,0,114,101,102,0,0,0,0,0,108,105,110,107,0,0,0,0,40,41,0,0,0,0,0,0,95,105,0,0,0,0,0,0,73,115,87,111,114,100,0,0,102,105,108,101,104,97,110,100,108,101,91,44,97,114,103,115,93,0,0,0,0,0,0,0,70,111,114,109,97,116,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,112,97,110,105,99,58,32,100,101,108,95,98,97,99,107,114,101,102,44,32,42,115,118,112,61,37,112,44,32,115,118,61,37,112,0,0,0,0,0,0,95,95,0,0,0,0,0,0,78,65,76,78,85,77,85,0,67,97,110,39,116,32,117,115,101,32,39,37,99,39,32,105,110,32,97,32,103,114,111,117,112,32,119,105,116,104,32,100,105,102,102,101,114,101,110,116,32,98,121,116,101,45,111,114,100,101,114,32,105,110,32,37,115,0,0,0,0,0,0,0,117,116,105,109,101,0,0,0,83,101,108,102,45,116,105,101,115,32,111,102,32,97,114,114,97,121,115,32,97,110,100,32,104,97,115,104,101,115,32,97,114,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,0,0,0,67,97,110,39,116,32,117,115,101,32,115,116,114,105,110,103,32,40,34,37,45,51,50,112,34,37,115,41,32,97,115,32,97,32,115,117,98,114,111,117,116,105,110,101,32,114,101,102,32,119,104,105,108,101,32,34,115,116,114,105,99,116,32,114,101,102,115,34,32,105,110,32,117,115,101,0,0,0,0,0,37,45,112,32,100,105,100,32,110,111,116,32,114,101,116,117,114,110,32,97,32,116,114,117,101,32,118,97,108,117,101,0,37,115,37,46,42,115,37,115,10,0,0,0,0,0,0,0,115,113,114,116,0,0,0,0,99,104,109,111,100,0,0,0,97,116,116,114,105,98,117,116,101,115,0,0,0,0,0,0,70,69,84,67,72,83,73,90,69,32,114,101,116,117,114,110,101,100,32,97,32,110,101,103,97,116,105,118,101,32,118,97,108,117,101,0,0,0,0,0,69,109,112,116,121,32,92,37,99,123,125,0,0,0,0,0,37,0,0,0,0,0,0,0,117,110,108,105,110,107,0,0,35,32,99,111,109,109,101,110,116,10,0,0,0,0,0,0,41,0,0,0,0,0,0,0,99,104,111,119,110,0,0,0,122,90,55,57,126,0,0,0,97,65,48,49,33,32,0,0,92,120,123,0,0,0,0,0,102,116,98,105,110,97,114,121,0,0,0,0,0,0,0,0,114,110,102,116,98,120,99,97,118,0,0,0,0,0,0,0,63,58,0,0,0,0,0,0,102,116,116,101,120,116,0,0,119,100,115,93,0,0,0,0,115,114,101,102,103,101,110,0,102,116,116,116,121,0,0,0,117,110,111,112,101,110,101,100,0,0,0,0,0,0,0,0,93,41,125,32,61,0,0,0,85,115,105,110,103,32,106,117,115,116,32,116,104,101,32,102,105,114,115,116,32,99,104,97,114,97,99,116,101,114,32,114,101,116,117,114,110,101,100,32,98,121,32,92,78,123,125,32,105,110,32,99,104,97,114,97,99,116,101,114,32,99,108,97,115,115,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,117,116,102,56,58,58,84,111,83,112,101,99,67,102,0,0,104,118,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,99,104,97,114,97,99,116,101,114,32,37,115,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,97,102,116,101,114,32,37,45,112,60,45,45,32,72,69,82,69,32,110,101,97,114,32,99,111,108,117,109,110,32,37,100,0,0,102,116,108,105,110,107,0,0,112,97,110,105,99,58,32,100,101,108,95,98,97,99,107,114,101,102,44,32,42,115,118,112,61,37,112,32,112,104,97,115,101,61,37,115,32,114,101,102,99,110,116,61,37,108,117,0,91,35,33,37,42,60,62,40,41,45,61,0,0,0,0,0,46,125,0,0,0,0,0,0,78,65,76,78,85,77,76,0,67,97,110,39,116,32,117,115,101,32,98,111,116,104,32,39,60,39,32,97,110,100,32,39,62,39,32,97,102,116,101,114,32,116,121,112,101,32,39,37,99,39,32,105,110,32,37,115,0,0,0,0,0,0,0,0,102,116,115,118,116,120,0,0,67,97,110,39,116,32,108,111,99,97,116,101,32,111,98,106,101,99,116,32,109,101,116,104,111,100,32,34,37,115,34,32,118,105,97,32,112,97,99,107,97,103,101,32,34,37,45,112,34,0,0,0,0,0,0,0,97,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,78,111,110,45,111,99,116,97,108,32,99,104,97,114,97,99,116,101,114,32,39,37,99,39,46,32,32,82,101,115,111,108,118,101,100,32,97,115,32,34,92,111,123,37,46,42,115,125,34,0,0,0,0,0,0,0,67,97,110,39,116,32,114,101,116,117,114,110,32,111,117,116,115,105,100,101,32,97,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,0,73,103,110,111,114,105,110,103,32,122,101,114,111,32,108,101,110,103,116,104,32,92,78,123,125,32,105,110,32,99,104,97,114,97,99,116,101,114,32,99,108,97,115,115,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,0,0,0,0,108,111,103,0,0,0,0,0,78,111,32,100,105,114,101,99,116,111,114,121,32,115,112,101,99,105,102,105,101,100,32,102,111,114,32,45,73,0,0,0,102,116,115,103,105,100,0,0,85,115,101,108,101,115,115,32,108,111,99,97,108,105,122,97,116,105,111,110,32,111,102,32,37,115,0,0,0,0,0,0,78,117,109,98,101,114,32,119,105,116,104,32,110,111,32,100,105,103,105,116,115,0,0,0,70,69,84,67,72,83,73,90,69,0,0,0,0,0,0,0,92,78,123,78,65,77,69,125,32,109,117,115,116,32,98,101,32,114,101,115,111,108,118,101,100,32,98,121,32,116,104,101,32,108,101,120,101,114,0,0,102,116,115,117,105,100,0,0,77,105,115,115,105,110,103,32,114,105,103,104,116,32,98,114,97,99,101,32,111,110,32,92,111,123,0,0,0,0,0,0,85,43,0,0,0,0,0,0,116,114,117,110,99,97,116,101,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,0,102,116,112,105,112,101,0,0,77,105,115,115,105,110,103,32,98,114,97,99,101,115,32,111,110,32,92,111,123,125,0,0,102,116,100,105,114,0,0,0,34,92,99,37,99,34,32,105,115,32,109,111,114,101,32,99,108,101,97,114,108,121,32,119,114,105,116,116,101,110,32,115,105,109,112,108,121,32,97,115,32,34,37,115,34,0,0,0,92,78,32,105,110,32,97,32,99,104,97,114,97,99,116,101,114,32,99,108,97,115,115,32,109,117,115,116,32,98,101,32,97,32,110,97,109,101,100,32,99,104,97,114,97,99,116,101,114,58,32,92,78,123,46,46,46,125,0,0,0,0,0,0,102,116,102,105,108,101,0,0,34,92,99,123,34,32,105,115,32,100,101,112,114,101,99,97,116,101,100,32,97,110,100,32,105,115,32,109,111,114,101,32,99,108,101,97,114,108,121,32,119,114,105,116,116,101,110,32,97,115,32,34,59,34,0,0,102,116,98,108,107,0,0,0,67,104,97,114,97,99,116,101,114,32,102,111,108,108,111,119,105,110,103,32,34,92,99,34,32,109,117,115,116,32,98,101,32,65,83,67,73,73,0,0,102,116,99,104,114,0,0,0,113,113,0,0,0,0,0,0,114,101,102,103,101,110,0,0,102,116,115,111,99,107,0,0,99,108,111,115,101,100,0,0,84,111,67,102,0,0,0,0,83,67,65,76,65,82,91,44,32,82,69,70,67,79,85,78,84,93,0,0,0,0,0,0,92,120,37,48,50,88,0,0,102,116,122,101,114,111,0,0,112,97,110,105,99,58,32,100,101,108,95,98,97,99,107,114,101,102,44,32,115,118,112,61,48,0,0,0,0,0,0,0,116,114,0,0,0,0,0,0,78,65,76,78,85,77,0,0,39,37,99,39,32,97,108,108,111,119,101,100,32,111,110,108,121,32,97,102,116,101,114,32,116,121,112,101,115,32,37,115,32,105,110,32,37,115,0,0,102,116,101,111,119,110,101,100,0,0,0,0,0,0,0,0,84,73,69,83,67,65,76,65,82,0,0,0,0,0,0,0,78,111,116,32,97,32,67,79,68,69,32,114,101,102,101,114,101,110,99,101,0,0,0,0,112,97,110,105,99,58,32,99,111,110,115,116,97,110,116,32,111,118,101,114,102,108,111,119,101,100,32,97,108,108,111,99,97,116,101,100,32,115,112,97,99,101,44,32,37,108,117,32,62,61,32,37,108,117,0,0,78,111,32,68,66,58,58,68,66,32,114,111,117,116,105,110,101,32,100,101,102,105,110,101,100,0,0,0,0,0,0,0,82,101,99,111,109,112,105,108,101,32,112,101,114,108,32,119,105,116,104,32,45,68,68,69,66,85,71,71,73,78,71,32,116,111,32,117,115,101,32,45,68,32,115,119,105,116,99,104,32,40,100,105,100,32,121,111,117,32,109,101,97,110,32,45,100,32,63,41,10,0,0,0,102,116,114,111,119,110,101,100,0,0,0,0,0,0,0,0,67,97,110,39,116,32,108,111,99,97,108,105,122,101,32,108,101,120,105,99,97,108,32,118,97,114,105,97,98,108,101,32,37,45,112,0,0,0,0,0,77,105,115,115,105,110,103,32,99,111,110,116,114,111,108,32,99,104,97,114,32,110,97,109,101,32,105,110,32,92,99,0,102,116,99,116,105,109,101,0,68,101,112,114,101,99,97,116,101,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,92,78,123,46,46,46,125,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,32,105,110,32,92,78,123,37,46,42,115,60,45,45,32,72,69,82,69,32,37,46,42,115,0,0,0,0,112,97,110,105,99,58,32,85,110,107,110,111,119,110,32,114,101,103,101,120,32,99,104,97,114,97,99,116,101,114,32,115,101,116,32,101,110,99,111,100,105,110,103,58,32,37,117,0,73,79,32,108,97,121,101,114,115,32,40,108,105,107,101,32,39,37,46,42,115,39,41,32,117,110,97,118,97,105,108,97,98,108,101,0,0,0,0,0,102,116,97,116,105,109,101,0,46,37,88,0,0,0,0,0,73,110,116,101,114,110,97,108,32,100,105,115,97,115,116,101,114,0,0,0,0,0,0,0,102,116,109,116,105,109,101,0,92,78,123,85,43,37,88,0,85,110,114,101,99,111,103,110,105,122,101,100,32,101,115,99,97,112,101,32,92,37,46,42,115,32,112,97,115,115,101,100,32,116,104,114,111,117,103,104,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,102,116,115,105,122,101,0,0,73,110,118,97,108,105,100,32,101,115,99,97,112,101,32,105,110,32,116,104,101,32,115,112,101,99,105,102,105,101,100,32,101,110,99,111,100,105,110,103,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,114,0,0,0,0,0,0,0,102,116,105,115,0,0,0,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,114,101,116,117,114,110,101,100,32,98,121,32,92,78,0,0,102,116,101,101,120,101,99,0,73,110,118,97,108,105,100,32,104,101,120,97,100,101,99,105,109,97,108,32,110,117,109,98,101,114,32,105,110,32,92,78,123,85,43,46,46,46,125,0,84,114,97,105,108,105,110,103,32,92,0,0,0,0,0,0,112,114,111,116,111,116,121,112,101,0,0,0,0,0,0,0,102,116,101,119,114,105,116,101,0,0,0,0,0,0,0,0,70,105,108,101,104,97,110,100,108,101,32,111,112,101,110,101,100,32,111,110,108,121,32,102,111,114,32,37,115,112,117,116,0,0,0,0,0,0,0,0,77,105,115,115,105,110,103,32,114,105,103,104,116,32,98,114,97,99,101,32,111,110,32,92,78,123,125,32,111,114,32,117,110,101,115,99,97,112,101,100,32,108,101,102,116,32,98,114,97,99,101,32,97,102,116,101,114,32,92,78,46,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,92,103,123,46,46,46,125,32,112,97,116,116,101,114,110,0,0,0,0,117,116,102,56,58,58,84,111,83,112,101,99,76,99,0,0,83,67,65,76,65,82,91,44,32,79,78,93,0,0,0,0,113,0,0,0,0,0,0,0,102,116,101,114,101,97,100,0,82,101,102,101,114,101,110,99,101,32,105,115,32,97,108,114,101,97,100,121,32,119,101,97,107,0,0,0,0,0,0,0,77,105,115,115,105,110,103,32,114,105,103,104,116,32,98,114,97,99,101,32,111,110,32,92,78,123,125,0,0,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,92,103,46,46,46,32,112,97,116,116,101,114,110,0,0,0,0,0,0,65,76,78,85,77,65,0,0,115,83,105,73,108,76,120,88,110,78,118,86,64,46,0,0,102,116,114,101,120,101,99,0,84,73,69,72,65,78,68,76,69,0,0,0,0,0,0,0,83,117,98,115,116,105,116,117,116,105,111,110,32,108,111,111,112,0,0,0,0,0,0,0,77,105,115,115,105,110,103,32,98,114,97,99,101,115,32,111,110,32,92,78,123,125,0,0,85,85,85,85,85,85,85,85,85,85,85,85,85,0,0,0,82,101,102,101,114,101,110,99,101,32,116,111,32,110,111,110,101,120,105,115,116,101,110,116,32,111,114,32,117,110,99,108,111,115,101,100,32,103,114,111,117,112,0,0,0,0,0,0,73,108,108,101,103,97,108,32,109,111,100,117,108,117,115,32,122,101,114,111,0,0,0,0,102,116,114,119,114,105,116,101,0,0,0,0,0,0,0,0,108,111,99,97,108,0,0,0,77,105,115,115,105,110,103,32,114,105,103,104,116,32,98,114,97,99,101,32,111,110,32,92,120,123,125,0,0,0,0,0,83,84,79,82,69,0,0,0,82,101,102,101,114,101,110,99])
.concat([101,32,116,111,32,105,110,118,97,108,105,100,32,103,114,111,117,112,32,48,0,0,0,0,71,108,111,98,97,108,32,115,121,109,98,111,108,32,34,37,115,37,45,112,34,32,114,101,113,117,105,114,101,115,32,101,120,112,108,105,99,105,116,32,112,97,99,107,97,103,101,32,110,97,109,101,0,0,0,0,102,116,114,114,101,97,100,0,85,110,114,101,99,111,103,110,105,122,101,100,32,101,115,99,97,112,101,32,92,37,99,32,112,97,115,115,101,100,32,116,104,114,111,117,103,104,0,0,83,101,113,117,101,110,99,101,32,37,46,50,115,46,46,46,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,67,97,110,39,116,32,111,112,101,110,32,37,115,58,32,37,115,0,0,0,0,0,0,0,108,76,117,85,69,81,70,0,77,105,115,115,105,110,103,32,114,105,103,104,116,32,98,114,97,99,101,32,111,110,32,92,37,99,123,125,0,0,0,0,108,115,116,97,116,0,0,0,92,37,99,32,98,101,116,116,101,114,32,119,114,105,116,116,101,110,32,97,115,32,36,37,99,0,0,0,0,0,0,0,34,92,66,123,34,32,105,115,32,100,101,112,114,101,99,97,116,101,100,59,32,117,115,101,32,34,92,66,92,123,34,32,105,110,115,116,101,97,100,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,0,103,101,116,112,101,101,114,110,97,109,101,0,0,0,0,0,80,111,115,115,105,98,108,101,32,117,110,105,110,116,101,110,100,101,100,32,105,110,116,101,114,112,111,108,97,116,105,111,110,32,111,102,32,36,92,32,105,110,32,114,101,103,101,120,0,0,0,0,0,0,0,0,34,92,98,123,34,32,105,115,32,100,101,112,114,101,99,97,116,101,100,59,32,117,115,101,32,34,92,98,92,123,34,32,105,110,115,116,101,97,100,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,0,103,101,116,115,111,99,107,110,97,109,101,0,0,0,0,0,40,41,124,32,13,10,9,0,81,117,97,110,116,105,102,105,101,114,32,102,111,108,108,111,119,115,32,110,111,116,104,105,110,103,0,0,0,0,0,0,115,115,111,99,107,111,112,116,0,0,0,0,0,0,0,0,58,39,123,36,0,0,0,0,73,110,116,101,114,110,97,108,32,117,114,112,0,0,0,0,97,110,111,110,99,111,100,101,0,0,0,0,0,0,0,0,103,115,111,99,107,111,112,116,0,0,0,0,0,0,0,0,70,105,108,101,104,97,110,100,108,101,32,37,45,112,32,111,112,101,110,101,100,32,111,110,108,121,32,102,111,114,32,37,115,112,117,116,0,0,0,0,65,109,98,105,103,117,111,117,115,32,114,97,110,103,101,32,105,110,32,116,114,97,110,115,108,105,116,101,114,97,116,105,111,110,32,111,112,101,114,97,116,111,114,0,0,0,0,0,85,110,109,97,116,99,104,101,100,32,91,0,0,0,0,0,84,111,76,99,0,0,0,0,85,115,101,108,101,115,115,32,97,115,115,105,103,110,109,101,110,116,32,116,111,32,97,32,116,101,109,112,111,114,97,114,121,0,0,0,0,0,0,0,115,118,44,32,102,97,105,108,111,107,61,48,0,0,0,0,113,114,0,0,0,0,0,0,115,104,117,116,100,111,119,110,0,0,0,0,0,0,0,0,67,97,110,39,116,32,119,101,97,107,101,110,32,97,32,110,111,110,114,101,102,101,114,101,110,99,101,0,0,0,0,0,112,97,110,105,99,58,32,117,110,107,110,111,119,110,32,114,101,103,115,116,99,108,97,115,115,32,37,100,0,0,0,0,73,110,118,97,108,105,100,32,114,97,110,103,101,32,34,37,99,45,37,99,34,32,105,110,32,116,114,97,110,115,108,105,116,101,114,97,116,105,111,110,32,111,112,101,114,97,116,111,114,0,0,0,0,0,0,0,78,101,115,116,101,100,32,113,117,97,110,116,105,102,105,101,114,115,0,0,0,0,0,0,65,76,78,85,77,85,0,0,115,83,105,73,108,76,113,81,106,74,102,70,100,68,112,80,40,0,0,0,0,0,0,0,97,99,99,101,112,116,0,0,67,97,110,110,111,116,32,116,105,101,32,117,110,114,101,105,102,105,97,98,108,101,32,97,114,114,97,121,0,0,0,0,112,97,110,105,99,58,32,112,112,95,115,117,98,115,116,44,32,112,109,61,37,112,44,32,115,61,37,112,0,0,0,0,87,97,114,110,105,110,103,58,32,85,115,101,32,111,102,32,34,37,46,42,115,34,32,119,105,116,104,111,117,116,32,112,97,114,101,110,116,104,101,115,101,115,32,105,115,32,97,109,98,105,103,117,111,117,115,0,97,108,108,0,0,0,0,0,37,46,42,115,32,109,97,116,99,104,101,115,32,110,117,108,108,32,115,116,114,105,110,103,32,109,97,110,121,32,116,105,109,101,115,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,73,108,108,101,103,97,108,32,100,105,118,105,115,105,111,110,32,98,121,32,122,101,114,111,0,0,0,0,0,0,0,0,32,115,112,108,105,116,40,47,44,47,44,113,123,37,115,125,41,59,0,0,0,0,0,0,9,40,68,105,100,32,121,111,117,32,109,101,97,110,32,34,108,111,99,97,108,34,32,105,110,115,116,101,97,100,32,111,102,32,34,111,117,114,34,63,41,10,0,0,0,0,0,0,108,105,115,116,101,110,0,0,110,111,110,45,108,118,97,108,117,101,32,115,117,98,114,111,117,116,105,110,101,32,99,97,108,108,0,0,0,0,0,0,85,115,101,32,111,102,32,99,111,109,109,97,45,108,101,115,115,32,118,97,114,105,97,98,108,101,32,108,105,115,116,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,70,69,84,67,72,0,0,0,67,97,110,39,116,32,100,111,32,123,110,44,109,125,32,119,105,116,104,32,110,32,62,32,109,0,0,0,0,0,0,0,9,40,68,105,100,32,121,111,117,32,109,101,97,110,32,38,37,45,112,32,105,110,115,116,101,97,100,63,41,10,0,0,99,111,110,110,101,99,116,0,9,40,77,105,115,115,105,110,103,32,111,112,101,114,97,116,111,114,32,98,101,102,111,114,101,32,37,45,112,63,41,10,0,0,0,0,0,0,0,0,81,117,97,110,116,105,102,105,101,114,32,105,110,32,123,44,125,32,98,105,103,103,101,114,32,116,104,97,110,32,37,100,0,0,0,0,0,0,0,0,67,97,110,39,116,32,100,111,32,105,110,112,108,97,99,101,32,101,100,105,116,32,111,110,32,37,115,58,32,37,115,0,98,105,110,100,0,0,0,0,9,40,68,111,32,121,111,117,32,110,101,101,100,32,116,111,32,112,114,101,100,101,99,108,97,114,101,32,37,45,112,63,41,10,0,0,0,0,0,0,74,117,110,107,32,111,110,32,101,110,100,32,111,102,32,114,101,103,101,120,112,0,0,0,115,111,99,107,112,97,105,114,0,0,0,0,0,0,0,0,9,40,77,105,115,115,105,110,103,32,115,101,109,105,99,111,108,111,110,32,111,110,32,112,114,101,118,105,111,117,115,32,108,105,110,101,63,41,10,0,85,110,109,97,116,99,104,101,100,32,41,0,0,0,0,0,37,115,32,102,111,117,110,100,32,119,104,101,114,101,32,111,112,101,114,97,116,111,114,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,0,85,110,109,97,116,99,104,101,100,32,40,0,0,0,0,0,115,119,105,116,99,104,0,0,114,101,99,118,0,0,0,0,67,97,110,39,116,32,102,105,110,100,32,115,116,114,105,110,103,32,116,101,114,109,105,110,97,116,111,114,32,37,99,37,115,37,99,32,97,110,121,119,104,101,114,101,32,98,101,102,111,114,101,32,69,79,70,0,85,115,101,108,101,115,115,32,117,115,101,32,111,102,32,40,63,45,112,41,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,0,0,0,0,115,101,110,100,0,0,0,0,114,101,97,100,112,105,112,101,0,0,0,0,0,0,0,0,85,115,101,108,101,115,115,32,40,37,115,99,41,32,45,32,37,115,117,115,101,32,47,103,99,32,109,111,100,105,102,105,101,114,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,114,118,50,99,118,0,0,0,112,97,110,105,99,58,32,117,110,107,110,111,119,110,32,115,116,117,100,121,32,115,105,122,101,32,37,117,0,0,0,0,102,108,111,99,107,0,0,0,105,110,0,0,0,0,0,0,113,119,120,114,0,0,0,0,100,111,110,39,116,32,0,0,117,116,102,56,58,58,84,111,83,112,101,99,84,99,0,0,115,118,0,0,0,0,0,0,66,97,100,32,101,118,97,108,108,101,100,32,115,117,98,115,116,105,116,117,116,105,111,110,32,112,97,116,116,101,114,110,0,0,0,0,0,0,0,0,105,111,99,116,108,0,0,0,68,111,110,39,116,32,107,110,111,119,32,104,111,119,32,116,111,32,104,97,110,100,108,101,32,109,97,103,105,99,32,111,102,32,116,121,112,101,32,92,37,111,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,115,121,113,0,0,0,0,65,76,78,85,77,76,0,0,84,111,111,32,100,101,101,112,108,121,32,110,101,115,116,101,100,32,40,41,45,103,114,111,117,112,115,32,105,110,32,37,115,0,0,0,0,0,0,0,85,110,105,99,111,100,101,32,110,111,110,45,99,104,97,114,97,99,116,101,114,32,85,43,37,48,52,108,88,32,105,115,32,105,108,108,101,103,97,108,32,102,111,114,32,111,112,101,110,32,105,110,116,101,114,99,104,97,110,103,101,0,0,0,102,99,110,116,108,0,0,0,84,73,69,65,82,82,65,89,0,0,0,0,0,0,0,0,85,115,101,32,111,102,32,102,114,101,101,100,32,118,97,108,117,101,32,105,110,32,105,116,101,114,97,116,105,111,110,0,95,95,80,65,67,75,65,71,69,95,95,0,0,0,0,0,119,97,114,110,105,110,103,115,58,58,66,105,116,115,0,0,63,45,0,0,0,0,0,0,117,115,101,32,68,101,118,101,108,58,58,0,0,0,0,0,85,115,97,103,101,58,32,37,50,112,40,37,115,41,0,0,34,111,117,114,34,32,118,97,114,105,97,98,108,101,32,37,45,112,32,114,101,100,101,99,108,97,114,101,100,0,0,0,66,105,110,97,114,121,32,110,117,109,98,101,114,32,62,32,48,98,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,32,110,111,110,45,112,111,114,116,97,98,108,101,0,100,111,32,98,108,111,99,107,0,0,0,0,0,0,0,0,110,111,0,0,0,0,0,0,85,115,101,108,101,115,115,32,40,37,115,37,99,41,32,45,32,37,115,117,115,101,32,47,37,99,32,109,111,100,105,102,105,101,114,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,86,97,114,105,97,98,108,101,32,34,37,99,37,45,112,34,32,105,115,32,110,111,116,32,105,109,112,111,114,116,101,100,0,0,0,0,0,0,0,0,115,101,101,107,0,0,0,0,117,115,101,0,0,0,0,0,82,101,103,101,120,112,32,109,111,100,105,102,105,101,114,32,34,37,99,34,32,109,97,121,32,110,111,116,32,97,112,112,101,97,114,32,97,102,116,101,114,32,116,104,101,32,34,45,34,0,0,0,0,0,0,0,67,97,110,39,116,32,114,101,109,111,118,101,32,37,115,58,32,37,115,44,32,115,107,105,112,112,105,110,103,32,102,105,108,101,0,0,0,0,0,0,116,101,108,108,0,0,0,0,34,37,115,34,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,32,101,120,112,114,101,115,115,105,111,110,0,0,82,101,103,101,120,112,32,109,111,100,105,102,105,101,114,115,32,34,37,99,34,32,97,110,100,32,34,37,99,34,32,97,114,101,32,109,117,116,117,97,108,108,121,32,101,120,99,108,117,115,105,118,101,0,0,0,101,111,102,0,0,0,0,0,80,111,115,115,105,98,108,101,32,117,110,105,110,116,101,110,100,101,100,32,105,110,116,101,114,112,111,108,97,116,105,111,110,32,111,102,32,37,45,112,32,105,110,32,115,116,114,105,110,103,0,0,0,0,0,0,82,101,103,101,120,112,32,109,111,100,105,102,105,101,114,32,34,37,99,34,32,109,97,121,32,110,111,116,32,97,112,112,101,97,114,32,116,119,105,99,101,0,0,0,0,0,0,0,10,59,0,0,0,0,0,0,32,119,104,105,108,101,32,114,117,110,110,105,110,103,32,119,105,116,104,32,45,116,32,115,119,105,116,99,104,0,0,0,115,121,115,119,114,105,116,101,0,0,0,0,0,0,0,0,67,97,110,39,116,32,117,115,101,32,34,109,121,32,37,115,34,32,105,110,32,115,111,114,116,32,99,111,109,112,97,114,105,115,111,110,0,0,0,0,82,101,103,101,120,112,32,109,111,100,105,102,105,101,114,32,34,37,99,34,32,109,97,121,32,97,112,112,101,97,114,32,97,32,109,97,120,105,109,117,109,32,111,102,32,116,119,105,99,101,0,0,0,0,0,0,115,121,115,114,101,97,100,0,99,109,112,0,0,0,0,0,83,101,113,117,101,110,99,101,32,40,63,32,105,110,99,111,109,112,108,101,116,101,0,0,115,121,115,115,101,101,107,0,60,61,62,0,0,0,0,0,85,110,107,110,111,119,110,32,115,119,105,116,99,104,32,99,111,110,100,105,116,105,111,110,32,40,63,40,37,46,50,115,0,0,0,0,0,0,0,0,73,79,58,58,70,105,108,101,58,58,0,0,0,0,0,0,97,118,50,97,114,121,108,101,110,0,0,0,0,0,0,0,115,121,115,111,112,101,110,0,111,117,116,0,0,0,0,0,112,97,110,105,99,58,32,99,111,114,114,117,112,116,32,115,97,118,101,100,32,115,116,97,99,107,32,105,110,100,101,120,32,37,108,100,0,0,0,0,83,119,105,116,99,104,32,40,63,40,99,111,110,100,105,116,105,111,110,41,46,46,46,32,99,111,110,116,97,105,110,115,32,116,111,111,32,109,97,110,121,32,98,114,97,110,99,104,101,115,0,0,0,0,0,0,84,111,84,99,0,0,0,0,34,0,0,0,0,0,0,0,112,97,110,105,99,58,32,115,118,95,99,104,111,112,32,112,116,114,61,37,112,44,32,115,116,97,114,116,61,37,112,44,32,101,110,100,61,37,112,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,99,104,97,114,97,99,116,101,114,32,40,102,97,116,97,108,41,0,0,0,0,0,0,0,78,111,32,112,97,99,107,97,103,101,32,110,97,109,101,32,97,108,108,111,119,101,100,32,102,111,114,32,118,97,114,105,97,98,108,101,32,37,115,32,105,110,32,34,111,117,114,34,0,0,0,0,0,0,0,0,40,63,40,68,69,70,73,78,69,41,46,46,46,46,41,32,100,111,101,115,32,110,111,116,32,97,108,108,111,119,32,98,114,97,110,99,104,101,115,0,65,76,78,85,77,0,0,0,40,41,45,103,114,111,117,112,32,115,116,97,114,116,115,32,119,105,116,104,32,97,32,99,111,117,110,116,32,105,110,32,37,115,0,0,0,0,0,0,84,73,69,72,65,83,72,0,112,97,110,105,99,58,32,112,112,95,105,116,101,114,44,32,116,121,112,101,61,37,117,0,78,111,32,99,111,109,109,97,32,97,108,108,111,119,101,100,32,97,102,116,101,114,32,37,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,119,105,116,99,104,32,99,111,110,100,105,116,105,111,110,32,110,111,116,32,114,101,99,111,103,110,105,122,101,100,0,40,97,110,111,110,121,109,111,117,115,41,0,0,0,0,0,110,111,32,68,101,118,101,108,58,58,0,0,0,0,0,0,115,116,97,116,101,109,101,110,116,0,0,0,0,0,0,0,112,114,116,102,0,0,0,0,37,115,32,40,46,46,46,41,32,105,110,116,101,114,112,114,101,116,101,100,32,97,115,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,83,101,113,117,101,110,99,101,32,40,63,40,37,99,46,46,46,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,0,0,0,0,0,108,101,97,118,101,119,114,105,116,101,0,0,0,0,0,0,59,38,47,124,125,41,93,111,97,105,117,119,101,102,33,61,0,0,0,0,0,0,0,0,66,79,76,0,0,0,0,0,69,118,97,108,45,103,114,111,117,112,32,105,110,32,105,110,115,101,99,117,114,101,32,114,101,103,117,108,97,114,32,101,120,112,114,101,115,115,105,111,110,0,0,0,0,0,0,0,85,110,100,101,102,105,110,101,100,32,115,117,98,114,111,117,116,105,110,101,32,105,110,32,115,111,114,116,0,0,0,0,67,97,110,39,116,32,114,101,110,97,109,101,32,37,115,32,116,111,32,37,45,112,58,32,37,115,44,32,115,107,105,112,112,105,110,103,32,102,105,108,101,0,0,0,0,0,0,0,101,110,116,101,114,119,114,105,116,101,0,0,0,0,0,0,67,111,100,101,32,109,105,115,115,105,110,103,32,97,102,116,101,114,32,39,47,39,32,105,110,32,112,97,99,107,0,0,125,125,32,100,105,100,32,110,111,116,32,114,101,116,117,114,110,32,97,32,100,101,102,105,110,101,100,32,118,97,108,117,101,0,0,0,0,0,0,0,69,118,97,108,45,103,114,111,117,112,32,110,111,116,32,97,108,108,111,119,101,100,32,97,116,32,114,117,110,116,105,109,101,44,32,117,115,101,32,114,101,32,39,101,118,97,108,39,0,0,0,0,0,0,0,0,114,101,97,100,0,0,0,0,67,97,108,108,32,116,111,32,38,123,36,94,72,123,0,0,110,111,112,0,0,0,0,0,103,101,116,99,0,0,0,0,114,101,0,0,0,0,0,0,115,101,108,101,99,116,0,0,114,98,0,0,0,0,0,0,80,114,111,112,97,103,97,116,101,100,0,0,0,0,0,0,83,101,113,117,101,110,99,101,32,40,63,123,46,46,46,125,41,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,32,111,114,32,110,111,116,32,123,125,45,98,97,108,97,110,99,101,100,0,0,0,0,0,115,115,101,108,101,99,116,0,67,111,110,115,116,97,110,116,40,37,115,41,58,32,37,115,37,115,37,115,0,0,0,0,82,101,102,101,114,101,110,99,101,32,116,111,32,110,111,110,101,120,105,115,116,101,110,116,32,103,114,111,117,112,0,0,114,118,50,115,118,0,0,0,100,98,109,99,108,111,115,101,0,0,0,0,0,0,0,0,44,32,39,46,39,32,110,111,116,32,105,110,32,80,65,84,72,0,0,0,0,0,0,0,125,32,105,115,32,110,111,116,32,100,101,102,105,110,101,100,0,0,0,0,0,0,0,0,69,120,112,101,99,116,105,110,103,32,99,108,111,115,101,32,98,114,97,99,107,101,116,0,117,116,102,56,58,58,84,111,83,112,101,99,85,99,0,0,112,97,110,105,99,58,32,121,121,108,101,120,44,32,42,115,61,37,117,0,0,0,0,0,100,98,109,111,112,101,110,0,112,97,110,105,99,58,32,115,118,95,115,101,116,112,118,110,32,99,97,108,108,101,100,32,119,105,116,104,32,110,101,103,97,116,105,118,101,32,115,116,114,108,101,110,32,37,108,100,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,112,97,114,101,110,95,101,108,101,109,115,95,116,111,95,112,117,115,104,32,111,102,102,115,101,116,32,37,108,117,32,111,117,116,32,111,102,32,114,97,110,103,101,32,40,37,108,117,45,37,108,100,41,0,0,0,0,36,94,72,123,0,0,0,0,73,108,108,101,103,97,108,32,112,97,116,116,101,114,110,0,65,78,89,79,70,86,0,0,73,110,118,97,108,105,100,32,116,121,112,101,32,39,44,39,32,105,110,32,37,115,0,0,116,105,101,100,0,0,0,0,66,73,78,77,79,68,69,0,68,69,76,69,84,69,0,0,40,101,118,97,108,41,0,0,83,101,113,117,101,110,99,101,32,40,63,82,41,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,0,67,111,110,115,116,97,110,116,32,115,117,98,114,111,117,116,105,110,101,32,37,45,112,32,117,110,100,101,102,105,110,101,100,0,0,0,0,0,0,0,115,99,111,112,101,0,0,0,117,110,116,105,101,0,0,0,85,110,101,120,112,101,99,116,101,100,32,99,111,110,115,116,97,110,116,32,108,118,97,108,117,101,32,101,110,116,101,114,115,117,98,32,101,110,116,114,121,32,118,105,97,32,116,121,112,101,47,116,97,114,103,32,37,108,100,58,37,108,117,0,67,111,110,115,116,97,110,116,40,37,115,41,32,117,110,107,110,111,119,110,0,0,0,0,95,84,79,80,0,0,0,0,83,101,113,117,101,110,99,101,32,40,63,35,46,46,46,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,65,116,116,101,109,112,116,32,116,111,32,100,101,108,101,116,101,32,100,105,115,97,108,108,111,119,101,100,32,107,101,121,32,39,37,45,112,39,32,102,114,111,109,32,97,32,114,101,115,116,114,105,99,116,101,100,32,104,97,115,104,0,0,0,116,105,101,0,0,0,0,0,66,69,71,73,78,0,0,0,58,115,104,111,114,116,0,0,58,98,121,116,101,115,0,0,83,101,113,117,101,110,99,101,32,40,63,37,99,46,46,46,41,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,67,97,110,39,116,32,100,111,32,105,110,112,108,97,99,101,32,101,100,105,116,58,32,37,45,112,32,119,111,117,108,100,32,110,111,116,32,98,101,32,117,110,105,113,117,101,0,0,98,105,110,109,111,100,101,0,58,102,117,108,108,0,0,0,112,97,110,105,99,58,32,112,97,114,101,110,95,110,97,109,101,32,104,97,115,104,32,101,108,101,109,101,110,116,32,97,108,108,111,99,97,116,105,111,110,32,102,97,105,108,101,100,0,0,0,0,0,0,0,0,117,109,97,115,107,0,0,0,118,53,46,49,54,46,51,0,95,99,104,97,114,110,97,109,101,115,0,0,0,0,0,0,112,97,110,105,99,58,32,114,101,103,95,115,99,97,110,95,110,97,109,101,32,114,101,116,117,114,110,101,100,32,78,85,76,76,0,0,0,0,0,0,112,97,110,105,99,58,32,112,97,100,95,97,108,108,111,99,44,32,37,112,33,61,37,112,0,0,0,0,0,0,0,0,102,105,108,101,110,111,0,0,99,104,97,114,110,97,109,101,115,0,0,0,0,0,0,0,83,101,113,117,101,110,99,101,32,40,63,37,99,46,46,46,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,112,105,112,101,95,111,112,0,65,109,98,105,103,117,111,117,115,32,117,115,101,32,111,102,32,37,99,123,37,45,112,125,32,114,101,115,111,108,118,101,100,32,116,111,32,37,99,37,45,112,0,0,0,0,0,0,83,101,113,117,101,110,99,101,32,40,37,46,42,115,46,46,46,41,32,110,111,116,32,114,101,99,111,103,110,105,122,101,100,0,0,0,0,0,0,0,99,108,111,115,101,0,0,0,65,109,98,105,103,117,111,117,115,32,117,115,101,32,111,102,32,37,99,123,37,115,37,115,125,32,114,101,115,111,108,118,101,100,32,116,111,32,37,99,37,115,37,115,0,0,0,0,83,101,113,117,101,110,99,101,32,37,46,51,115,46,46,46,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,67,97,110,39,116,32,117,115,101,32,103,108,111,98,97,108,32,37,99,94,37,99,37,46,42,115,32,105,110,32,34,37,115,34,0,0,0,0,0,0,114,118,50,103,118,0,0,0,32,111,110,32,80,65,84,72,0,0,0,0,0,0,0,0,123,46,46,46,125,0,0,0,84,111,85,99,0,0,0,0,108,111,98,106,0,0,0,0,85,92,108,0,0,0,0,0,99,111,110,116,105,110,117,101,0,0,0,0,0,0,0,0,85,110,100,101,102,105,110,101,100,32,118,97,108,117,101,32,97,115,115,105,103,110,101,100,32,116,111,32,116,121,112,101,103,108,111,98,0,0,0,0,112,97,110,105,99,58,32,112,97,114,101,110,95,101,108,101,109,115,95,116,111,95,112,117,115,104,44,32,37,105,32,60,32,48,0,0,0,0,0,0,79,83,84,77,65,84,67,72,0,0,0,0,0,0,0,0,91,46,46,46,93,0,0,0,86,101,114,98,32,112,97,116,116,101,114,110,32,39,37,46,42,115,39,32,104,97,115,32,97,32,109,97,110,100,97,116,111,114,121,32,97,114,103,117,109,101,110,116,0,0,0,0,67,97,110,39,116,32,108,105,110,101,97,114,105,122,101,32,97,110,111,110,121,109,111,117,115,32,115,121,109,98,111,108,32,116,97,98,108,101,0,0,65,78,89,79,70,0,0,0,112,97,110,105,99,58,32,109,97,114,107,115,32,98,101,121,111,110,100,32,115,116,114,105,110,103,32,101,110,100,44,32,109,61,37,112,44,32,109,97,114,107,115,61,37,112,44,32,108,101,118,101,108,61,37,100,0,0,0,0,0,0,0,0,98,114,101,97,107,0,0,0,117,109,97,115,107,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,65,116,116,101,109,112,116,32,116,111,32,97,99,99,101,115,115,32,100,105,115,97,108,108,111,119,101,100,32,107,101,121,32,39,37,45,112,39,32,105,110,32,97,32,114,101,115,116,114,105,99,116,101,100,32,104,97,115,104,0,0,0,0,0,69,88,73,83,84,83,0,0,91,92,93,94,95,63,0,0,40,117,110,107,110,111,119,110,41,0,0,0,0,0,0,0,86,101,114,98,32,112,97,116,116,101,114,110,32,39,37,46,42,115,39,32,109,97,121,32,110,111,116,32,104,97,118,101,32,97,110,32,97,114,103,117,109,101,110,116,0,0,0,0,67,65,76,65,82,0,0,0,80,69,82,76,53,68,66,95,84,72,82,69,65,68,69,68,0,0,0,0,0,0,0,0,108,101,97,118,101,119,104,101,110,0,0,0,0,0,0,0,112,97,110,105,99,58,32,117,110,101,120,112,101,99,116,101,100,32,108,118,97,108,117,101,32,101,110,116,101,114,115,117,98,32,97,114,103,115,58,32,116,121,112,101,47,116,97,114,103,32,37,108,100,58,37,108,117,0,0,0,0,0,0,0,85,115,101,32,111,102,32,47,99,32,109,111,100,105,102,105,101,114,32,105,115,32,109,101,97,110,105,110,103,108,101,115,115,32,119,105,116,104,111,117,116,32,47,103,0,0,0,0,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,0,0,85,115,101,32,111,102,32,105,110,104,101,114,105,116,101,100,32,65,85,84,79,76,79,65,68,32,102,111,114,32,110,111,110,45,109,101,116,104,111,100,32,37,45,112,58,58,37,45,112,40,41,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,0,0,101,110,116,101,114,119,104,101,110,0,0,0,0,0,0,0,83,101,97,114,99,104,32,112,97,116,116,101,114,110,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,85,110,107,110,111,119,110,32,118,101,114,98,32,112,97,116,116,101,114,110,32,39,37,46,42,115,39,0,0,0,0,0,108,101,97,118,101,103,105,118,101,110,0,0,0,0,0,0,83,101,97,114,99,104,32,112,97,116,116,101,114,110,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,32,111,114,32,116,101,114,110,97,114,121,32,111,112,101,114,97,116,111,114,32,112,97,114,115,101,100,32,97,115,32,115,101,97,114,99,104,32,112,97,116,116,101,114,110,0,0,0,0,0,0,84,72,69,78,0,0,0,0,101,110,116,101,114,103,105,118,101,110,0,0,0,0,0,0,109,115,105,120,111,112,97,100,108,117,103,99,0,0,0,0,77,65,82,75,0,0,0,0,67,97,110,39,116,32,114,101,116,117,114,110,32,97,114,114,97,121,32,116,111,32,108,118,97,108,117,101,32,115,99,97,108,97,114,32,99,111,110,116,101,120,116,0,0,0,0,0,109,101,116,104,111,100,95,110,97,109,101,100,0,0,0,0,109,115,105,120,111,112,97,100,108,117,0,0,0,0,0,0,70,65,73,76,0,0,0,0,101,120,105,116,0,0,0,0,82,101,103,101,120,112,32,109,111,100,105,102,105,101,114,32,34,47,37,99,34,32,109,97,121,32,110,111,116,32,97,112,112,101,97,114,32,116,119,105,99,101,0,0,0,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,118,101,114,98,32,112,97,116,116,101,114,110,0,0,0,0,0,0,0,103,111,116,111,0,0,0,0,82,101,103,101,120,112,32,109,111,100,105,102,105,101,114,32,34,47,97,34,32,109,97,121,32,97,112,112,101,97,114,32,97,32,109,97,120,105,109,117,109,32,111,102,32,116,119,105,99,101,0,0,0,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,118,101,114,98,32,112,97,116,116,101,114,110,32,97,114,103,117,109,101,110,116,0,0,0,0,0,0,112,117,115,104,114,101,0,0,100,117,109,112,0,0,0,0,102,105,110,100,0,0,0,0,82,101,103,101,120,112,32,109,111,100,105,102,105,101,114,115,32,34,47,37,99,34,32,97,110,100,32,34,47,37,99,34,32,97,114,101,32,109,117,116,117,97,108,108,121,32,101,120,99,108,117,115,105,118,101,0,37,115,32,105,110,32,114,101,103,101,120,59,32,109,97,114,107,101,100,32,98,121,32,60,45,45,32,72,69,82,69,32,105,110,32,109,47,37,46,42,115,32,60,45,45,32,72,69,82,69,32,37,115,47,0,0,112,97,110,105,99,58,32,116,111,95,117,112,112,101,114,95,116,105,116,108,101,95,108,97,116,105,110,49,32,100,105,100,32,110,111,116,32,101,120,112,101,99,116,32,39,37,99,39,32,116,111,32,109,97,112,32,116,111,32,39,37,99,39,0,111,112,101,114,97,116,105,111,110,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,119,105,116,104,32,118,101,114,115,105,111,110,32,111,98,106,101,99,116,0,0,0,0,0,76,92,117,0,0,0,0,0,58,99,114,108,102,0,0,0,114,101,100,111,0,0,0,0,67,97,110,110,111,116,32,99,111,112,121,32,116,111,32,37,115,0,0,0,0,0,0,0,112,97,110,105,99,58,32,85,110,101,120,112,101,99,116,101,100,32,111,112,32,37,117,0,72,97,118,105,110,103,32,110,111,32,115,112,97,99,101,32,98,101,116,119,101,101,110,32,112,97,116,116,101,114,110,32,97,110,100,32,102,111,108,108,111,119,105,110,103,32,119,111,114,100,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,0,0,0,67,65,78,89,0,0,0,0,117,110,112,97,99,107,0,0,70,73,76,69,78,79,0,0,110,101,120,116,0,0,0,0,117,116,102,56,32,34,92,120,37,48,50,88,34,32,100,111,101,115,32,110,111,116,32,109,97,112,32,116,111,32,85,110,105,99,111,100,101,0,0,0,65,109,98,105,103,117,111,117,115,32,117,115,101,32,111,102,32,39,115,47,47,108,101,46,46,46,39,32,114,101,115,111,108,118,101,100,32,97,115,32,39,115,47,47,32,108,101,46,46,46,39,59,32,82,101,119,114,105,116,101,32,97,115,32,39,115,47,47,101,108,39,32,105,102,32,121,111,117,32,109,101,97,110,116,32,39,117,115,101,32,108,111,99,97,108,101,32,114,117,108,101,115,32,97,110,100,32,101,118,97,108,117,97,116,101,32,114,104,115,32,97,115,32,97,110,32,101,120,112,114,101,115,115,105,111,110,39,46,32,32,73,110,32,80,101,114,108,32,53,46,49,56,44,32,105,116,32,119,105,108,108,32,98,101,32,114,101,115,111,108,118,101,100,32,116,104,101,32,111,116,104,101,114,32,119,97,121,0,0,0,0,0,67,111,114,114,117,112,116,101,100,32,114,101,103,101,120,112,32,111,112,99,111,100,101,32,37,100,32,62,32,37,100,0,47,0,0,0,0,0,0,0,108,97,115,116,0,0,0,0,85,115,101,108,101,115,115,32,117,115,101,32,111,102,32,37,45,112,32,105,110,32,118,111,105,100,32,99,111,110,116,101,120,116,0,0,0,0,0,0,125,0,0,0,0,0,0,0,112,97,110,105,99,58,32,114,101,103,102,114,101,101,32,100,97,116,97,32,99,111,100,101,32,39,37,99,39,0,0,0,67,97,110,39,116,32,108,111,99,97,116,101,32,111,98,106,101,99,116,32,109,101,116,104,111,100,32,34,37,45,112,34,32,118,105,97,32,112,97,99,107,97,103,101,32,34,37,45,112,34,32,40,112,101,114,104,97,112,115,32,121,111,117,32,102,111,114,103,111,116,32,116,111,32,108,111,97,100,32,34,37,45,112,34,63,41,0,0,114,101,116,117,114,110,0,0,123,0,0,0,0,0,0,0,112,97,110,105,99,58,32,112,114,101,103,102,114,101,101,32,99,111,109,112,112,97,100,0,67,97,110,39,116,32,100,111,32,105,110,112,108,97,99,101,32,101,100,105,116,58,32,37,115,32,105,115,32,110,111,116,32,97,32,114,101,103,117,108,97,114,32,102,105,108,101,0,108,101,97,118,101,108,111,111,112,0,0,0,0,0,0,0,100,111,32,0,0,0,0,0,37,48,52,108,88,10,0,0,101,110,116,101,114,108,111,111,112,0,0,0,0,0,0,0,101,118,97,108,32,0,0,0,37,48,52,108,88,9,37,48,52,108,88,10,0,0,0,0,105,116,101,114,0,0,0,0,85,115,101,32,111,102,32,47,99,32,109,111,100,105,102,105,101,114,32,105,115,32,109,101,97,110,105,110,103,108,101,115,115,32,105,110,32,115,47,47,47,0,0,0,0,0,0,0,37,48,52,108,88,9,73,78,70,73,78,73,84,89,10,0,101,110,116,101,114,105,116,101,114,0,0,0,0,0,0,0,109,115,105,120,111,112,97,100,108,117,103,99,101,114,0,0,83,117,98,115,116,105,116,117,116,105,111,110,32,114,101,112,108,97,99,101,109,101,110,116,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,82,101,103,101,120,112,0,0,112,97,100,97,110,121,0,0,108,101,97,118,101,0,0,0,101,120,101,99,117,116,101,0,83,117,98,115,116,105,116,117,116,105,111,110,32,112,97,116,116,101,114,110,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,0,0,112,97,110,105,99,58,32,85,110,107,110,111,119,110,32,102,108,97,103,115,32,37,100,32,105,110,32,110,97,109,101,100,95,98,117,102,102,95,115,99,97,108,97,114,0,0,0,0,108,111,98,106,32,105,115,32,110,111,116,32,111,102,32,116,121,112,101,32,118,101,114,115,105,111,110,0,0,0,0,0,85,115,101,108,101,115,115,32,117,115,101,32,111,102,32,92,69,0,0,0,0,0,0,0,101,110,116,101,114,0,0,0,67,97,110,110,111,116,32,99,111,112,121,32,116,111,32,37,115,32,105,110,32,37,115,0,82,69,71,69,82,82,79,82,0,0,0,0,0,0,0,0,84,114,97,110,115,108,105,116,101,114,97,116,105,111,110,32,114,101,112,108,97,99,101,109,101,110,116,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,0,0,0,112,97,110,105,99,58,32,85,110,107,110,111,119,110,32,102,108,97,103,115,32,37,100,32,105,110,32,110,97,109,101,100,95,98,117,102,102,95,105,116,101,114,0,0,0,0,0,0,83,65,78,89,0,0,0,0,112,97,99,107,0,0,0,0,112,105,112,101,0,0,0,0,117,110,115,116,97,99,107,0,36,38,42,40,41,123,125,91,93,39,34,59,92,124,63,60,62,126,96,0,0,0,0,0,84,114,97,110,115,108,105,116,101,114,97,116,105,111,110,32,112,97,116,116,101,114,110,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,85,110,107,110,111,119,110,32,101,114,114,111,114,10,0,0,112,97,110,105,99,58,32,85,110,107,110,111,119,110,32,102,108,97,103,115,32,37,100,32,105,110,32,110,97,109,101,100,95,98,117,102,102,0,0,0,65,67,75,65,71,69,0,0,114,101,113,117,105,114,101,32,113,37,99,37,115,37,99,0,100,98,115,116,97,116,101,0,97,32,99,111,110,115,116,97,110,116,32,40,117,110,100,101,102,41,0,0,0,0,0,0,68,101,108,105,109,105,116,101,114,32,102,111,114,32,104,101,114,101,32,100,111,99,117,109,101,110,116,32,105,115,32,116,111,111,32,108,111,110,103,0,100,101,108,101,116,101,0,0,67,97,110,39,116,32,108,111,99,97,116,101,32,111,98,106,101,99,116,32,109,101,116,104,111,100,32,34,37,45,112,34,32,118,105,97,32,112,97,99,107,97,103,101,32,34,37,50,112,34,0,0,0,0,0,0,110,101,120,116,115,116,97,116,101,0,0,0,0,0,0,0,85,115,101,32,111,102,32,98,97,114,101,32,60,60,32,116,111,32,109,101,97,110,32,60,60,34,34,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,0,0,112,97,110,105,99,58,32,115,121,115,111,112,101,110,32,119,105,116,104,32,109,117,108,116,105,112,108,101,32,97,114,103,115,44,32,110,117,109,95,115,118,115,61,37,108,100,0,0,108,105,110,101,115,101,113,0,82,101,103,101,120,112,32,111,117,116,32,111,102,32,115,112,97,99,101,0,0,0,0,0,114,101,115,101,116,0,0,0,65,82,71,86,0,0,0,0,37,115,32,105,110,32,114,101,103,101,120,32,109,47,37,46,42,115,37,115,47,0,0,0,100,105,101,0,0,0,0,0,71,108,111,98,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,0,0,119,97,114,110,0,0,0,0,85,110,116,101,114,109,105,110,97,116,101,100,32,60,62,32,111,112,101,114,97,116,111,114,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,116,111,112,95,101,110,118,44,32,118,61,37,100,10,0,0,0,99,97,108,108,101,114,0,0,69,120,99,101,115,115,105,118,101,108,121,32,108,111,110,103,32,60,62,32,111,112,101,114,97,116,111,114,0,0,0,0,114,101,103,99,111,109,112,0,66,97,114,101,119,111,114,100,32,34,37,45,112,34,32,110,111,116,32,97,108,108,111,119,101,100,32,119,104,105,108,101,32,34,115,116,114,105,99,116,32,115,117,98,115,34,32,105,110,32,117,115,101,0,0,0,112,97,100,104,118,0,0,0,108,101,97,118,101,115,117,98,108,118,0,0,0,0,0,0,67,97,110,39,116,32,37,115,32,37,115,37,115,37,115,0,112,97,110,105,99,58,32,117,116,102,49,54,95,116,101,120,116,102,105,108,116,101,114,32,99,97,108,108,101,100,32,97,102,116,101,114,32,101,114,114,111,114,32,40,115,116,97,116,117,115,61,37,108,100,41,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,49,54,32,115,117,114,114,111,103,97,116,101,0,0,0,0,0,0,108,111,98,106,44,32,46,46,46,0,0,0,0,0,0,0,78,111,32,115,117,99,104,32,99,108,97,115,115,32,102,105,101,108,100,32,34,37,45,112,34,32,105,110,32,118,97,114,105,97,98,108,101,32,37,45,112,32,111,102,32,116,121,112,101,32,37,50,112,0,0,0,102,105,108,116,101,114,95,100,101,108,32,99,97,110,32,111,110,108,121,32,100,101,108,101,116,101,32,105,110,32,114,101,118,101,114,115,101,32,111,114,100,101,114,32,40,99,117,114,114,101,110,116,108,121,41,0,108,101,97,118,101,115,117,98,0,0,0,0,0,0,0,0,66,105,122,97,114,114,101,32,99,111,112,121,32,111,102,32,37,115,0,0,0,0,0,0,99,111,114,114,117,112,116,101,100,32,114,101,103,101,120,112,32,112,111,105,110,116,101,114,115,0,0,0,0,0,0,0,112,97,110,105,99,58,32,117,116,102,49,54,95,116,101,120,116,102,105,108,116,101,114,32,99,97,108,108,101,100,32,105,110,32,98,108,111,99,107,32,109,111,100,101,32,40,102,111,114,32,37,100,32,99,104,97,114,97,99,116,101,114,115,41,0,0,0,0,0,0,0,0,70,73,69,76,68,83,0,0,82,69,71,95,65,78,89,0,67,104,97,114,97,99,116,101,114,40,115,41,32,105,110,32,39,37,99,39,32,102,111,114,109,97,116,32,119,114,97,112,112,101,100,32,105,110,32,37,115,0,0,0,0,0,0,0,101,110,116,101,114,115,117,98,0,0,0,0,0,0,0,0,44,32,99,111,114,101,32,100,117,109,112,101,100,0,0,0,85,110,115,117,112,112,111,114,116,101,100,32,115,99,114,105,112,116,32,101,110,99,111,100,105,110,103,32,85,84,70,45,51,50,66,69,0,0,0,0,37,45,112,67,111,109,112,105,108,97,116,105,111,110,32,102,97,105,108,101,100,32,105,110,32,114,101,113,117,105,114,101,0,0,0,0,0,0,0,0,37,45,112,40,41,32,99,97,108,108,101,100,32,116,111,111,32,101,97,114,108,121,32,116,111,32,99,104,101,99,107,32,112,114,111,116,111,116,121,112,101,0,0,0,0,0,0,0,65,77,69,0,0,0,0,0,34,37,115,34,32,118,97,114,105,97,98,108,101,32,37,45,112,32,109,97,115,107,115,32,101,97,114,108,105,101,114,32,100,101,99,108,97,114,97,116,105,111,110,32,105,110,32,115,97,109,101,32,37,115,0,0,97,32,99,111,110,115,116,97,110,116,32,40,37,45,112,41,0,0,0,0,0,0,0,0,85,110,115,117,112,112,111,114,116,101,100,32,115,99,114,105,112,116,32,101,110,99,111,100,105,110,103,32,85,84,70,45,51,50,76,69,0,0,0,0,9,40,77,97,121,98,101,32,121,111,117,32,109,101,97,110,116,32,115,121,115,116,101,109,40,41,32,119,104,101,110,32,121,111,117,32,115,97,105,100,32,101,120,101,99,40,41,63,41,10,0,0,0,0,0,0,73,79,47,70,105,108,101,46,112,109,0,0,0,0,0,0,100,111,114,97,115,115,105,103,110,0,0,0,0,0,0,0,67,97,110,39,116,32,117,110,100,101,102,32,97,99,116,105,118,101,32,115,117,98,114,111,117,116,105,110,101,0,0,0,83,116,97,116,101,109,101,110,116,32,117,110,108,105,107,101,108,121,32,116,111,32,98,101,32,114,101,97,99,104,101,100,0,0,0,0,0,0,0,0,105,110,112,108,97,99,101,32,111,112,101,110,0,0,0,0,111,114,97,115,115,105,103,110,0,0,0,0,0,0,0,0,85,115,101,32,111,102,32,113,119,40,46,46,46,41,32,97,115,32,112,97,114,101,110,116,104,101,115,101,115,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,67,97,110,39,116,32,100,101,99,108,97,114,101,32,37,115,32,105,110,32,34,37,115,34,0,0,0,0,0,0,0,0])
.concat([97,110,100,97,115,115,105,103,110,0,0,0,0,0,0,0,112,97,110,105,99,58,32,102,111,108,100,95,99,111,110,115,116,97,110,116,115,32,74,77,80,69,78,86,95,80,85,83,72,32,114,101,116,117,114,110,101,100,32,37,100,0,0,0,99,111,110,100,95,101,120,112,114,0,0,0,0,0,0,0,82,101,112,108,97,99,101,109,101,110,116,32,108,105,115,116,32,105,115,32,108,111,110,103,101,114,32,116,104,97,110,32,115,101,97,114,99,104,32,108,105,115,116,0,0,0,0,0,100,111,114,0,0,0,0,0,85,115,101,108,101,115,115,32,117,115,101,32,111,102,32,47,100,32,109,111,100,105,102,105,101,114,32,105,110,32,116,114,97,110,115,108,105,116,101,114,97,116,105,111,110,32,111,112,101,114,97,116,111,114,0,0,120,111,114,0,0,0,0,0,70,73,78,65,76,0,0,0,112,97,100,97,118,0,0,0,111,114,0,0,0,0,0,0,80,65,84,72,0,0,0,0,112,97,110,105,99,58,32,117,116,102,49,54,95,116,111,95,117,116,102,56,58,32,111,100,100,32,98,121,116,101,108,101,110,32,37,108,117,0,0,0,118,37,115,0,0,0,0,0,83,111,117,114,99,101,32,102,105,108,116,101,114,115,32,97,112,112,108,121,32,111,110,108,121,32,116,111,32,98,121,116,101,32,115,116,114,101,97,109,115,0,0,0,0,0,0,0,73,110,115,101,99,117,114,101,32,36,69,78,86,123,37,115,125,37,115,0,0,0,0,0,97,110,100,0,0,0,0,0,66,105,122,97,114,114,101,32,99,111,112,121,32,111,102,32,37,115,32,105,110,32,37,115,0,0,0,0,0,0,0,0,114,101,103,101,120,112,32,109,101,109,111,114,121,32,99,111,114,114,117,112,116,105,111,110,0,0,0,0,0,0,0,0,37,48,52,108,120,9,9,37,48,52,108,120,10,0,0,0,71,80,79,83,0,0,0,0,112,97,110,105,99,58,32,115,116,114,105,110,103,32,105,115,32,115,104,111,114,116,101,114,32,116,104,97,110,32,97,100,118,101,114,116,105,115,101,100,44,32,97,112,116,114,61,37,112,44,32,97,101,110,100,61,37,112,44,32,98,117,102,102,101,114,61,37,112,44,32,116,111,100,111,61,37,108,100,0,102,108,111,112,0,0,0,0,103,108,111,98,32,102,97,105,108,101,100,32,40,99,104,105,108,100,32,101,120,105,116,101,100,32,119,105,116,104,32,115,116,97,116,117,115,32,37,100,37,115,41,0,0,0,0,0,112,97,110,105,99,58,32,100,105,101,32,0,0,0,0,0,37,48,52,108,120,9,37,48,52,108,120,9,37,48,52,108,120,10,0,0,0,0,0,0,65,83,72,0,0,0,0,0,101,118,97,108,95,115,118,40,41,0,0,0,0,0,0,0,86,97,114,105,97,98,108,101,32,34,37,45,112,34,32,119,105,108,108,32,110,111,116,32,115,116,97,121,32,115,104,97,114,101,100,0,0,0,0,0,102,108,105,112,0,0,0,0,97,32,99,111,110,115,116,97,110,116,32,40,37,115,41,0,65,82,78,73,78,71,95,66,73,84,83,0,0,0,0,0,82,101,99,117,114,115,105,118,101,32,105,110,104,101,114,105,116,97,110,99,101,32,100,101,116,101,99,116,101,100,32,105,110,32,112,97,99,107,97,103,101,32,39,37,50,112,39,0,32,40,117,116,102,56,41,0,37,48,52,108,120,9,9,88,88,88,88,10,0,0,0,0,73,79,58,58,70,105,108,101,0,0,0,0,0,0,0,0,114,97,110,103,101,0,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,100,101,99,105,109,97,108,32,110,117,109,98,101,114,0,0,0,0,0,0,37,48,52,108,120,9,37,48,52,108,120,9,88,88,88,88,10,0,0,0,0,0,0,0,65,82,71,86,79,85,84,0,109,97,112,119,104,105,108,101,0,0,0,0,0,0,0,0,37,115,32,104,97,115,32,116,111,111,32,109,97,110,121,32,101,114,114,111,114,115,46,10,0,0,0,0,0,0,0,0,109,97,112,115,116,97,114,116,0,0,0,0,0,0,0,0,37,45,112,37,115,32,104,97,115,32,116,111,111,32,109,97,110,121,32,101,114,114,111,114,115,46,10,0,0,0,0,0,117,110,105,99,111,100,101,0,103,114,101,112,119,104,105,108,101,0,0,0,0,0,0,0,37,45,112,0,0,0,0,0,65,115,115,105,103,110,109,101,110,116,32,116,111,32,98,111,116,104,32,97,32,108,105,115,116,32,97,110,100,32,97,32,115,99,97,108,97,114,0,0,103,114,101,112,115,116,97,114,116,0,0,0,0,0,0,0,32,32,40,77,105,103,104,116,32,98,101,32,97,32,114,117,110,97,119,97,121,32,109,117,108,116,105,45,108,105,110,101,32,37,99,37,99,32,115,116,114,105,110,103,32,115,116,97,114,116,105,110,103,32,111,110,32,108,105,110,101,32,37,108,100,41,10,0,0,0,0,0,40,41,32,111,112,101,114,97,116,111,114,0,0,0,0,0,114,101,118,101,114,115,101,0,37,45,112,10,0,0,0,0,32,99,111,110,115,116,114,117,99,116,0,0,0,0,0,0,112,97,100,115,118,0,0,0,0,0,0,0,0,0,0,0,67,97,110,39,116,32,100,111,32,119,97,105,116,112,105,100,32,119,105,116,104,32,102,108,97,103,115,0,0,0,0,0,110,101,97,114,32,34,37,45,112,34,10,0,0,0,0,0,32,105,110,32,0,0,0,0,86,97,108,117,101,32,111,102,32,37,115,37,115,32,99,97,110,32,98,101,32,34,48,34,59,32,116,101,115,116,32,119,105,116,104,32,100,101,102,105,110,101,100,40,41,0,0,0,108,101,120,95,114,101,97,100,95,115,112,97,99,101,0,0,45,95,46,43,0,0,0,0,117,110,115,104,105,102,116,0,112,97,110,105,99,58,32,97,116,116,101,109,112,116,32,116,111,32,99,111,112,121,32,102,114,101,101,100,32,115,99,97,108,97,114,32,37,112,32,116,111,32,37,112,0,0,0,0,37,108,120,32,37,100,10,0,32,97,116,32,37,115,32,108,105,110,101,32,37,108,100,44,32,0,0,0,0,0,0,0,68,101,112,114,101,99,97,116,101,100,32,117,115,101,32,111,102,32,109,121,40,41,32,105,110,32,102,97,108,115,101,32,99,111,110,100,105,116,105,111,110,97,108,0,0,0,0,0,78,66,79,85,78,68,65,0,70,105,101,108,100,32,116,111,111,32,119,105,100,101,32,105,110,32,39,117,39,32,102,111,114,109,97,116,32,105,110,32,112,97,99,107,0,0,0,0,79,112,101,110,105,110,103,32,100,105,114,104,97,110,100,108,101,32,37,50,112,32,97,108,115,111,32,97,115,32,97,32,102,105,108,101,0,0,0,0,115,104,105,102,116,0,0,0,103,108,111,98,32,102,97,105,108,101,100,32,40,99,97,110,39,116,32,115,116,97,114,116,32,99,104,105,108,100,58,32,37,115,41,0,0,0,0,0,92,37,48,51,111,0,0,0,66,97,114,101,119,111,114,100,32,102,111,117,110,100,32,105,110,32,99,111,110,100,105,116,105,111,110,97,108,0,0,0,76,79,66,0,0,0,0,0,112,97,110,105,99,58,32,112,97,100,95,102,105,110,100,108,101,120,32,105,108,108,101,103,97,108,32,102,108,97,103,32,98,105,116,115,32,48,120,37,108,120,0,0,0,0,0,0,112,111,112,0,0,0,0,0,94,37,99,0,0,0,0,0,84,70,56,67,65,67,72,69,0,0,0,0,0,0,0,0,100,102,115,0,0,0,0,0,65,116,116,101,109,112,116,32,116,111,32,102,114,101,101,32,110,111,110,101,120,105,115,116,101,110,116,32,115,104,97,114,101,100,32,115,116,114,105,110,103,32,39,37,115,39,37,115,0,0,0,0,0,0,0,0,70,111,117,110,100,32,61,32,105,110,32,99,111,110,100,105,116,105,111,110,97,108,44,32,115,104,111,117,108,100,32,98,101,32,61,61,0,0,0,0,112,117,115,104,0,0,0,0,110,101,120,116,32,99,104,97,114,32,0,0,0,0,0,0,97,116,116,114,105,98,117,116,101,115,46,112,109,0,0,0,70,105,108,101,104,97,110,100,108,101,32,83,84,68,73,78,32,114,101,111,112,101,110,101,100,32,97,115,32,37,50,112,32,111,110,108,121,32,102,111,114,32,111,117,116,112,117,116,0,0,0,0,0,0,0,0,115,112,108,105,99,101,0,0,119,105,116,104,105,110,32,115,116,114,105,110,103,0,0,0,84,111,111,32,108,97,116,101,32,116,111,32,114,117,110,32,73,78,73,84,32,98,108,111,99,107,0,0,0,0,0,0,97,110,111,110,104,97,115,104,0,0,0,0,0,0,0,0,119,105,116,104,105,110,32,112,97,116,116,101,114,110,0,0,38,67,79,82,69,58,58,37,115,32,99,97,110,110,111,116,32,98,101,32,99,97,108,108,101,100,32,100,105,114,101,99,116,108,121,0,0,0,0,0,97,110,111,110,108,105,115,116,0,0,0,0,0,0,0,0,97,116,32,101,110,100,32,111,102,32,108,105,110,101,0,0,84,111,111,32,108,97,116,101,32,116,111,32,114,117,110,32,67,72,69,67,75,32,98,108,111,99,107,0,0,0,0,0,112,97,110,105,99,58,32,67,97,110,39,116,32,117,115,101,32,37,99,37,99,32,98,101,99,97,117,115,101,32,37,45,112,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,109,101,116,104,111,100,32,37,115,0,0,0,0,108,115,108,105,99,101,0,0,110,101,120,116,32,116,111,107,101,110,32,63,63,63,0,0,112,97,110,105,99,58,32,67,97,110,39,116,32,117,115,101,32,37,99,37,99,32,98,101,99,97,117,115,101,32,37,45,112,32,105,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,0,0,0,0,0,108,105,115,116,0,0,0,0,97,116,32,69,79,70,0,0,40,113,114,0,0,0,0,0,103,101,108,101,109,0,0,0,106,111,105,110,0,0,0,0,67,97,110,39,116,32,102,111,114,107,58,32,37,115,0,0,102,108,111,97,116,0,0,0,77,97,108,102,111,114,109,101,100,32,85,84,70,45,56,32,99,104,97,114,97,99,116,101,114,32,40,117,110,101,120,112,101,99,116,101,100,32,110,111,110,45,99,111,110,116,105,110,117,97,116,105,111,110,32,98,121,116,101,32,48,120,37,48,50,120,44,32,105,109,109,101,100,105,97,116,101,108,121,32,97,102,116,101,114,32,115,116,97,114,116,32,98,121,116,101,32,48,120,37,48,50,120,41,37,115,37,115,0,0,0,0,99,108,97,115,115,44,32,118,101,114,115,105,111,110,0,0,40,45,88,0,0,0,0,0,84,69,82,77,0,0,0,0,115,112,108,105,116,0,0,0,112,97,110,105,99,58,32,97,116,116,101,109,112,116,32,116,111,32,99,111,112,121,32,118,97,108,117,101,32,37,45,112,32,116,111,32,97,32,102,114,101,101,100,32,115,99,97,108,97,114,32,37,112,0,0,0,67,111,109,112,108,101,120,32,114,101,103,117,108,97,114,32,115,117,98,101,120,112,114,101,115,115,105,111,110,32,114,101,99,117,114,115,105,111,110,32,108,105,109,105,116,32,40,37,100,41,32,101,120,99,101,101,100,101,100,0,0,0,0,0,43,45,48,49,50,51,52,53,54,55,56,57,95,0,0,0,91,0,0,0,0,0,0,0,40,126,126,0,0,0,0,0,78,66,79,85,78,68,85,0,65,116,116,101,109,112,116,32,116,111,32,112,97,99,107,32,112,111,105,110,116,101,114,32,116,111,32,116,101,109,112,111,114,97,114,121,32,118,97,108,117,101,0,0,0,0,0,0,105,110,116,101,103,101,114,0,75,69,69,80,83,95,110,101,120,116,95,102,97,105,108,0,77,105,115,115,105,110,103,32,99,111,109,109,97,32,97,102,116,101,114,32,102,105,114,115,116,32,97,114,103,117,109,101,110,116,32,116,111,32,37,115,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,40,46,61,0,0,0,0,0,79,82,77,65,84,0,0,0,86,97,114,105,97,98,108,101,32,34,37,45,112,34,32,105,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,105,103,0,0,0,0,0,0,37,115,32,110,117,109,98,101,114,32,62,32,37,115,32,110,111,110,45,112,111,114,116,97,98,108,101,0,0,0,0,0,84,70,56,76,79,67,65,76,69,0,0,0,0,0,0,0,78,111,32,115,117,99,104,32,99,108,97,115,115,58,32,39,37,45,112,39,33,0,0,0,75,69,69,80,83,95,110,101,120,116,0,0,0,0,0,0,112,97,110,105,99,58,32,114,101,102,99,111,117,110,116,101,100,95,104,101,95,118,97,108,117,101,32,98,97,100,32,102,108,97,103,115,32,37,108,120,0,0,0,0,0,0,0,0,84,111,111,32,109,97,110,121,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,37,115,0,0,0,0,0,0,0,40,46,0,0,0,0,0,0,98,111,111,108,107,101,121,115,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,97,108,108,111,99,109,121,32,105,108,108,101,103,97,108,32,102,108,97,103,32,98,105,116,115,32,48,120,37,108,120,0,0,73,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,32,105,110,32,37,115,32,110,117,109,98,101,114,0,0,0,67,85,84,71,82,79,85,80,95,110,101,120,116,95,102,97,105,108,0,0,0,0,0,0,84,121,112,101,32,111,102,32,97,114,103,32,37,100,32,116,111,32,37,115,32,109,117,115,116,32,98,101,32,37,115,32,40,110,111,116,32,37,115,41,0,0,0,0,0,0,0,0,40,120,61,0,0,0,0,0,69,82,82,0,0,0,0,0,104,115,108,105,99,101,0,0,73,108,108,101,103,97,108,32,98,105,110,97,114,121,32,100,105,103,105,116,32,39,37,99,39,0,0,0,0,0,0,0,67,85,84,71,82,79,85,80,95,110,101,120,116,0,0,0,78,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,37,115,0,0,0,0,0,40,120,0,0,0,0,0,0,104,101,108,101,109,0,0,0,73,108,108,101,103,97,108,32,111,99,116,97,108,32,100,105,103,105,116,32,39,37,99,39,0,0,0,0,0,0,0,0,83,75,73,80,95,110,101,120,116,95,102,97,105,108,0,0,40,115,113,114,116,0,0,0,83,84,65,82,84,0,0,0,114,118,50,104,118,0,0,0,77,105,115,112,108,97,99,101,100,32,95,32,105,110,32,110,117,109,98,101,114,0,0,0,83,75,73,80,95,110,101,120,116,0,0,0,0,0,0,0,115,97,121,0,0,0,0,0,40,108,111,103,0,0,0,0,101,120,105,115,116,115,0,0,48,120,102,102,102,102,102,102,102,102,0,0,0,0,0,0,77,65,82,75,80,79,73,78,84,95,110,101,120,116,95,102,97,105,108,0,0,0,0,0,84,111,111,32,109,97,110,121,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,37,45,112,0,0,0,0,0,0,40,101,120,112,0,0,0,0,48,51,55,55,55,55,55,55,55,55,55,55,0,0,0,0,77,65,82,75,80,79,73,78,84,95,110,101,120,116,0,0,84,121,112,101,32,111,102,32,97,114,103,32,37,100,32,116,111,32,37,45,112,32,109,117,115,116,32,98,101,32,37,115,32,40,110,111,116,32,37,115,41,0,0,0,0,0,0,0,40,115,105,110,0,0,0,0,103,118,0,0,0,0,0,0,10,0,0,0,0,0,0,0,107,101,121,115,0,0,0,0,112,97,110,105,99,58,32,107,105,100,32,112,111,112,101,110,32,101,114,114,110,111,32,114,101,97,100,44,32,110,61,37,117,0,0,0,0,0,0,0,48,98,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,0,0,0,0,0,0,67,79,77,77,73,84,95,110,101,120,116,95,102,97,105,108,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,37,50,112,32,118,101,114,115,105,111,110,32,37,45,112,32,114,101,113,117,105,114,101,100,45,45,116,104,105,115,32,105,115,32,111,110,108,121,32,118,101,114,115,105,111,110,32,37,45,112,0,0,0,0,0,0,78,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,37,45,112,0,0,0,0,40,99,111,115,0,0,0,0,73,110,115,101,99,117,114,101,32,100,105,114,101,99,116,111,114,121,32,105,110,32,37,115,37,115,0,0,0,0,0,0,118,97,108,117,101,115,0,0,87,105,100,101,32,99,104,97,114,97,99,116,101,114,0,0,82,69,71,77,65,82,75,0,72,101,120,97,100,101,99,105,109,97,108,0,0,0,0,0,67,79,77,77,73,84,95,110,101,120,116,0,0,0,0,0,83,117,98,114,111,117,116,105,110,101,32,37,45,112,32,114,101,100,101,102,105,110,101,100,0,0,0,0,0,0,0,0,40,97,116,97,110,50,0,0,78,66,79,85,78,68,76,0,67,97,110,32,111,110,108,121,32,99,111,109,112,114,101,115,115,32,117,110,115,105,103,110,101,100,32,105,110,116,101,103,101,114,115,32,105,110,32,112,97,99,107,0,0,0,0,0,67,111,100,101,32,112,111,105,110,116,32,48,120,37,48,52,108,88,32,105,115,32,110,111,116,32,85,110,105,99,111,100,101,44,32,109,97,121,32,110,111,116,32,98,101,32,112,111,114,116,97,98,108,101,0,0,101,97,99,104,0,0,0,0,82,69,65,68,76,73,78,69,0,0,0,0,0,0,0,0,79,99,116,97,108,0,0,0,9,40,105,110,32,99,108,101,97,110,117,112,41,32,37,45,112,0,0,0,0,0,0,0,67,85,82,76,89,95,66,95,109,97,120,95,102,97,105,108,0,0,0,0,0,0,0,0,68,66,58,58,0,0,0,0,67,111,110,115,116,97,110,116,32,115,117,98,114,111,117,116,105,110,101,32,37,45,112,32,114,101,100,101,102,105,110,101,100,0,0,0,0,0,0,0,40,126,0,0,0,0,0,0,85,115,101,32,111,102,32,42,103,108,111,98,123,70,73,76,69,72,65,78,68,76,69,125,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,112,97,110,105,99,58,32,116,111,112,95,101,110,118,10,0,85,115,97,103,101,58,32,37,50,112,58,58,37,50,112,40,37,115,41,0,0,0,0,0,97,118,97,108,117,101,115,0,73,108,108,101,103,97,108,32,98,105,110,97,114,121,32,100,105,103,105,116,32,39,37,99,39,32,105,103,110,111,114,101,100,0,0,0,0,0,0,0,100,115,0,0,0,0,0,0,66,105,110,97,114,121,0,0,78,73,67,79,68,69,0,0,99,108,97,115,115,110,97,109,101,0,0,0,0,0,0,0,67,85,82,76,89,95,66,95,109,97,120,0,0,0,0,0,37,50,52,48,115,0,0,0,97,117,116,111,117,115,101,0,40,99,109,112,0,0,0,0,37,50,112,58,58,83,85,80,69,82,0,0,0,0,0,0,97,107,101,121,115,0,0,0,104,101,120,97,100,101,99,105,109,97,108,0,0,0,0,0,67,85,82,76,89,95,66,95,109,105,110,95,102,97,105,108,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,63,36,64,64,37,38,42,36,0,0,0,0,0,0,0,0,40,60,61,62,0,0,0,0,79,85,84,0,0,0,0,0,97,101,97,99,104,0,0,0,111,99,116,97,108,0,0,0,67,85,82,76,89,95,66,95,109,105,110,0,0,0,0,0,64,0,0,0,0,0,0,0,98,97,99,107,116,105,99,107,0,0,0,0,0,0,0,0,40,94,61,0,0,0,0,0,97,115,108,105,99,101,0,0,98,105,110,97,114,121,0,0,67,85,82,76,89,95,66,95,109,105,110,95,107,110,111,119,110,95,102,97,105,108,0,0,108,101,120,95,115,116,97,114,116,0,0,0,0,0,0,0,101,110,116,101,114,101,118,97,108,0,0,0,0,0,0,0,40,94,0,0,0,0,0,0,32,119,104,105,108,101,32,114,117,110,110,105,110,103,32,115,101,116,103,105,100,0,0,0,97,101,108,101,109,0,0,0,112,97,110,105,99,58,32,115,99,97,110,95,110,117,109,44,32,42,115,61,37,100,0,0,67,85,82,76,89,95,66,95,109,105,110,95,107,110,111,119,110,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,43,59,36,36,64,0,0,0,40,124,61,0,0,0,0,0,97,101,108,101,109,102,97,115,116,95,108,101,120,0,0,0,12,0,0,0,0,0,0,0,73,70,77,65,84,67,72,95,65,95,102,97,105,108,0,0,59,43,0,0,0,0,0,0,40,124,0,0,0,0,0,0,97,101,108,101,109,102,97,115,116,0,0,0,0,0,0,0,73,108,108,101,103,97,108,32,100,101,99,108,97,114,97,116,105,111,110,32,111,102,32,115,117,98,114,111,117,116,105,110,101,32,37,45,112,0,0,0,73,70,77,65,84,67,72,95,65,0,0,0,0,0,0,0,43,64,0,0,0,0,0,0,40,38,61,0,0,0,0,0,115,118,95,117,112,103,114,97,100,101,32,102,114,111,109,32,116,121,112,101,32,37,100,32,100,111,119,110,32,116,111,32,116,121,112,101,32,37,100,0,103,118,115,118,0,0,0,0,114,118,50,97,118,0,0,0,67,97,110,39,116,32,102,111,114,107,44,32,116,114,121,105,110,103,32,97,103,97,105,110,32,105,110,32,53,32,115,101,99,111,110,100,115,0,0,0,73,108,108,101,103,97,108,32,100,101,99,108,97,114,97,116,105,111,110,32,111,102,32,97,110,111,110,121,109,111,117,115,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,112,97,110,105,99,58,32,115,97,118,101,95,97,108,108,111,99,32,101,108,101,109,115,32,37,108,117,32,111,117,116,32,111,102,32,114,97,110,103,101,32,40,37,108,100,45,37,108,100,41,0,0,0,0,0,0,67,85,82,76,89,77,95,66,95,102,97,105,108,0,0,0,37,115,32,105,110,32,37,115,0,0,0,0,0,0,0,0,47,117,115,114,47,108,111,99,97,108,47,108,105,98,47,112,101,114,108,53,47,53,46,49,54,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,40,38,0,0,0,0,0,0,99,111,114,114,117,112,116,101,100,32,114,101,103,101,120,112,32,112,114,111,103,114,97,109,0,0,0,0,0,0,0,0,83,105,122,101,32,109,97,103,105,99,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,59,0,0,0,0,0,0,0,36,69,78,86,123,80,65,84,72,125,0,0,0,0,0,0,113,117,111,116,101,109,101,116,97,0,0,0,0,0,0,0,87,105,100,101,32,99,104,97,114,97,99,116,101,114,32,105,110,32,37,115,0,0,0,0,69,86,65,76,32,119,105,116,104,111,117,116,32,112,111,115,32,99,104,97,110,103,101,32,101,120,99,101,101,100,101,100,32,108,105,109,105,116,32,105,110,32,114,101,103,101,120,0,97,102,116,101,114,32,39,95,39,32,0,0,0,0,0,0,67,85,82,76,89,77,95,66,0,0,0,0,0,0,0,0,80,69,82,76,76,73,66,0,112,97,110,105,99,58,32,99,97,110,39,116,32,114,101,103,105,115,116,101,114,32,99,117,115,116,111,109,32,79,80,32,37,115,0,0,0,0,0,0,40,62,62,61,0,0,0,0,78,66,79,85,78,68,0,0,67,97,110,110,111,116,32,99,111,109,112,114,101,115,115,32,105,110,116,101,103,101,114,32,105,110,32,112,97,99,107,0,108,99,0,0,0,0,0,0,112,97,110,105,99,58,32,112,112,95,109,97,116,99,104,32,115,116,97,114,116,47,101,110,100,32,112,111,105,110,116,101,114,115,44,32,105,61,37,108,100,44,32,115,116,97,114,116,61,37,108,100,44,32,101,110,100,61,37,108,100,44,32,115,61,37,112,44,32,115,116,114,101,110,100,61,37,112,44,32,108,101,110,61,37,108,117,0,73,108,108,101,103,97,108,32,99,104,97,114,97,99,116,101,114,32,37,115,105,110,32,112,114,111,116,111,116,121,112,101,32,102,111,114,32,37,45,112,32,58,32,37,115,0,0,0,112,97,110,105,99,58,32,98,97,100,32,103,105,109,109,101,58,32,37,100,10,0,0,0,67,85,82,76,89,77,95,65,95,102,97,105,108,0,0,0,80,69,82,76,53,76,73,66,0,0,0,0,0,0,0,0,108,101,110,103,116,104,40,41,32,117,115,101,100,32,111,110,32,64,97,114,114,97,121,32,40,100,105,100,32,121,111,117,32,109,101,97,110,32,34,115,99,97,108,97,114,40,64,97,114,114,97,121,41,34,63,41,0,0,0,0,0,0,0,0,40,62,62,0,0,0,0,0,73,76,69,72,65,78,68,76,69,0,0,0,0,0,0,0,72,65,83,72,95,83,69,69,68,32,61,32,37,108,117,10,0,0,0,0,0,0,0,0,117,99,0,0,0,0,0,0,100,105,0,0,0,0,0,0,80,114,111,116,111,116,121,112,101,32,97,102,116,101,114,32,39,37,99,39,32,102,111,114,32,37,45,112,32,58,32,37,115,0,0,0,0,0,0,0,65,73,78,84,0,0,0,0,67,85,82,76,89,77,95,65,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,99,111,112,95,115,116,111,114,101,95,108,97,98,101,108,32,105,108,108,101,103,97,108,32,102,108,97,103,32,98,105,116,115,32,48,120,37,108,120,0,0,67,97,110,39,116,32,111,112,101,110,32,112,101,114,108,32,115,99,114,105,112,116,32,34,37,115,34,58,32,37,115,10,0,0,0,0,0,0,0,0,108,101,110,103,116,104,40,41,32,117,115,101,100,32,111,110,32,37,37,104,97,115,104,32,40,100,105,100,32,121,111,117,32,109,101,97,110,32,34,115,99,97,108,97,114,40,107,101,121,115,32,37,37,104,97,115,104,41,34,63,41,0,0,0,40,60,60,61,0,0,0,0,83,85,80,69,82,0,0,0,112,97,110,105,99,58,32,104,118,95,115,116,111,114,101,40,41,32,102,97,105,108,101,100,32,105,110,32,115,101,116,95,109,114,111,95,112,114,105,118,97,116,101,95,100,97,116,97,40,41,32,102,111,114,32,39,37,46,42,115,39,32,37,100,0,0,0,0,0,0,0,0,108,99,102,105,114,115,116,0,59,64,37,0,0,0,0,0,83,85,67,67,69,69,68,0,66,82,65,78,67,72,95,110,101,120,116,95,102,97,105,108,0,0,0,0,0,0,0,0,85,110,100,101,102,105,110,101,100,32,115,111,114,116,32,115,117,98,114,111,117,116,105,110,101,32,34,37,45,112,34,32,99,97,108,108,101,100,0,0,67,97,110,39,116,32,111,112,101,110,32,47,100,101,118,47,110,117,108,108,58,32,37,115,10,0,0,0,0,0,0,0,107,101,121,115,32,0,0,0,40,60,60,0,0,0,0,0,70,105,108,101,104,97,110,100,108,101,32,83,84,68,37,115,32,114,101,111,112,101,110,101,100,32,97,115,32,37,50,112,32,111,110,108,121,32,102,111,114,32,105,110,112,117,116,0,117,99,102,105,114,115,116,0,64,88,120,117,0,0,0,0,36,64,37,42,59,91,93,38,92,95,43,0,0,0,0,0,66,82,65,78,67,72,95,110,101,120,116,0,0,0,0,0,108,101,110,103,116,104,40,41,32,117,115,101,100,32,111,110,32,37,45,112,32,40,100,105,100,32,121,111,117,32,109,101,97,110,32,34,115,99,97,108,97,114,40,37,115,37,45,112,41,34,63,41,0,0,0,0,40,42,42,61,0,0,0,0,99,114,121,112,116,0,0,0,80,114,111,116,111,116,121,112,101,32,110,111,116,32,116,101,114,109,105,110,97,116,101,100,0,0,0,0,0,0,0,0,87,72,73,76,69,77,95,66,95,109,97,120,95,102,97,105,108,0,0,0,0,0,0,0,77,105,115,115,105,110,103,32,40,115,117,105,100,41,32,102,100,32,115,99,114,105,112,116,32,110,97,109,101,10,0,0,40,42,42,0,0,0,0,0,99,104,114,0,0,0,0,0,87,72,73,76,69,77,95,66,95,109,97,120,0,0,0,0,60,0,0,0,0,0,0,0,87,114,111,110,103,32,115,121,110,116,97,120,32,40,115,117,105,100,41,32,102,100,32,115,99,114,105,112,116,32,110,97,109,101,32,34,37,115,34,10,0,0,0,0,0,0,0,0,40,37,61,0,0,0,0,0,96,96,0,0,0,0,0,0,111,114,100,0,0,0,0,0,77,105,115,115,105,110,103,32,110,97,109,101,32,105,110,32,34,109,121,32,115,117,98,34,0,0,0,0,0,0,0,0,87,72,73,76,69,77,95,66,95,109,105,110,95,102,97,105,108,0,0,0,0,0,0,0,47,100,101,118,47,102,100,47,0,0,0,0,0,0,0,0,77,97,108,102,111,114,109,101,100,32,112,114,111,116,111,116,121,112,101,32,102,111,114,32,37,45,112,58,32,37,45,112,0,0,0,0,0,0,0,0,40,37,0,0,0,0,0,0,102,101,116,99,104,0,0,0,112,97,110,105,99,58,32,100,111,95,116,114,97,110,115,95,115,105,109,112,108,101,95,117,116,102,56,32,108,105,110,101,32,37,100,0,0,0,0,0,102,111,114,109,108,105,110,101,0,0,0,0,0,0,0,0,115,117,98,114,111,117,116,105,110,101,32,110,97,109,101,0,87,72,73,76,69,77,95,66,95,109,105,110,0,0,0,0,99,97,110,110,111,116,32,97,99,99,101,115,115,0,0,0,45,101,0,0,0,0,0,0,115,99,97,108,97,114,0,0,40,47,61,0,0,0,0,0,99,111,110,115,116,0,0,0,115,112,114,105,110,116,102,0,69,88,69,67,0,0,0,0,60,62,32,115,104,111,117,108,100,32,98,101,32,113,117,111,116,101,115,0,0,0,0,0,87,72,73,76,69,77,95,65,95,109,97,120,95,102,97,105,108,0,0,0,0,0,0,0,37,115,32,40,111,118,101,114,102,108,111,119,32,97,116,32,98,121,116,101,32,48,120,37,48,50,120,44,32,97,102,116,101,114,32,115,116,97,114,116,32,98,121,116,101,32,48,120,37,48,50,120,41,0,0,0,110,111,116,32,101,109,112,116,121,0,0,0,0,0,0,0,89,79,85,32,72,65,86,69,78,39,84,32,68,73,83,65,66,76,69,68,32,83,69,84,45,73,68,32,83,67,82,73,80,84,83,32,73,78,32,84,72,69,32,75,69,82,78,69,76,32,89,69,84,33,10,70,73,88,32,89,79,85,82,32,75,69,82,78,69,76,44,32,80,85,84,32,65,32,67,32,87,82,65,80,80,69,82,32,65,82,79,85,78,68,32,84,72,73,83,32,83,67,82,73,80,84,44,32,79,82,32,85,83,69,32,45,117,32,65,78,68,32,85,78,68,85,77,80,33,10,0,0,0,0,0,0,37,45,112,32,100,101,102,105,110,101,115,32,110,101,105,116,104,101,114,32,112,97,99,107,97,103,101,32,110,111,114,32,86,69,82,83,73,79,78,45,45,118,101,114,115,105,111,110,32,99,104,101,99,107,32,102,97,105,108,101,100,0,0,0,115,117,98,114,111,117,116,105,110,101,32,101,110,116,114,121,0,0,0,0,0,0,0,0,40,47,0,0,0,0,0,0,59,125,0,0,0,0,0,0,114,105,110,100,101,120,0,0,42,0,0,0,0,0,0,0,79,118,101,114,108,111,97,100,101,100,32,113,114,32,100,105,100,32,110,111,116,32,114,101,116,117,114,110,32,97,32,82,69,71,69,88,80,0,0,0,80,97,116,116,101,114,110,32,115,117,98,114,111,117,116,105,110,101,32,110,101,115,116,105,110,103,32,119,105,116,104,111,117,116,32,112,111,115,32,99,104,97,110,103,101,32,101,120,99,101,101,100,101,100,32,108,105,109,105,116,32,105,110,32,114,101,103,101,120,0,0,0,80,111,115,115,105,98,108,101,32,97,116,116,101,109,112,116,32,116,111,32,112,117,116,32,99,111,109,109,101,110,116,115,32,105,110,32,113,119,40,41,32,108,105,115,116,0,0,0,87,72,73,76,69,77,95,65,95,109,97,120,0,0,0,0,100,111,101,115,32,110,111,116,32,101,120,105,115,116,0,0,80,69,82,76,0,0,0,0,115,121,109,98,111,108,0,0,40,42,61,0,0,0,0,0,66,79,85,78,68,65,0,0,67,97,110,110,111,116,32,99,111,109,112,114,101,115,115,32,110,101,103,97,116,105,118,101,32,110,117,109,98,101,114,115,32,105,110,32,112,97,99,107,0,0,0,0,0,0,0,0,68,105,101,100,0,0,0,0,105,110,100,101,120,0,0,0,112,97,110,105,99,58,32,112,112,95,109,97,116,99,104,0,80,111,115,115,105,98,108,101,32,97,116,116,101,109,112,116,32,116,111,32,115,101,112,97,114,97,116,101,32,119,111,114,100,115,32,119,105,116,104,32,99,111,109,109,97,115,0,0,69,48,0,0,0,0,0,0,87,72,73,76,69,77,95,65,95,109,105,110,95,102,97,105,108,0,0,0,0,0,0,0,110,111,110,45,101,120,105,115,116,0,0,0,0,0,0,0,111,110,101,32,111,102,32,37,46,42,115,0,0,0,0,0,40,42,0,0,0,0,0,0,79,68,69,0,0,0,0,0,80,69,82,76,95,72,65,83,72,95,83,69,69,68,95,68,69,66,85,71,0,0,0,0,118,101,99,0,0,0,0,0,97,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,80,69,78,0,0,0,0,0,109,114,111,58,58,109,101,116,104,111,100,95,99,104,97,110,103,101,100,95,105,110,0,0,87,72,73,76,69,77,95,65,95,109,105,110,0,0,0,0,105,108,101,32,101,120,105,115,116,115,0,0,0,0,0,0,78,111,32,80,101,114,108,32,115,99,114,105,112,116,32,102,111,117,110,100,32,105,110,32,105,110,112,117,116,10,0,0,115,117,98,32,123,125,0,0,40,45,61,0,0,0,0,0,67,97,110,39,116,32,108,111,99,97,116,101,32,112,97,99,107,97,103,101,32,37,45,112,32,102,111,114,32,64,37,50,112,58,58,73,83,65,0,0,67,97,110,39,116,32,114,101,116,117,114,110,32,104,97,115,104,32,116,111,32,108,118,97,108,117,101,32,115,99,97,108,97,114,32,99,111,110,116,101,120,116,0,0,0,0,0,0,49,0,0,0,0,0,0,0,115,117,98,115,116,114,0,0,80,114,101,99,101,100,101,110,99,101,32,112,114,111,98,108,101,109,58,32,111,112,101,110,32,37,45,112,32,115,104,111,117,108,100,32,98,101,32,111,112,101,110,40,37,45,112,41,0,0,0,0,0,0,0,0,58,114,97,119,0,0,0,0,87,72,73,76,69,77,95,65,95,112,114,101,95,102,97,105,108,0,0,0,0,0,0,0,101,120,105,115,116,105,110,103,32,102,105,108,101,0,0,0,67,111,109,112,105,108,101,100,32,97,116,32,74,117,110,32,32,49,32,50,48,49,51,32,50,48,58,50,49,58,48,50,0,0,0,0,0,0,0,0,98,108,111,99,107,32,111,114,32,115,117,98,32,123,125,0,40,45,0,0,0,0,0,0,77,111,114,101,32,116,104,97,110,32,111,110,101,32,97,114,103,117,109,101,110,116,32,116,111,32,39,60,37,99,39,32,111,112,101,110,0,0,0,0,108,101,110,103,116,104,0,0,124,38,42,43,45,61,33,63,58,46,0,0,0,0,0,0,87,72,73,76,69,77,95,65,95,112,114,101,0,0,0,0,99,97,110,110,111,116,32,109,97,107,101,0,0,0,0,0,115,116,100,101,114,114,0,0,40,43,61,0,0,0,0,0,97,98,115,0,0,0,0,0,78,111,32,115,117,99,104,32,99,108,97,115,115,32,37,46,49,48,48,48,115,0,0,0,67,85,82,76,89,88,95,101,110,100,95,102,97,105,108,0,32,50,62,38,49,0,0,0,83,84,68,69,82,82,0,0,112,97,110,105,99,58,32,99,107,95,101,110,116,101,114,115,117,98,95,97,114,103,115,95,112,114,111,116,111,32,67,86,32,119,105,116,104,32,110,111,32,112,114,111,116,111,44,32,102,108,97,103,115,61,37,108,120,0,0,0,0,0,0,0,40,43,0,0,0,0,0,0,112,97,110,105,99,58,32,112,97,100,95,97,100,100,95,110,97,109,101,95,112,118,110,32,105,108,108,101,103,97,108,32,102,108,97,103,32,98,105,116,115,32,48,120,37,108,120,0,111,99,116,0,0,0,0,0,115,117,98,0,0,0,0,0,67,85,82,76,89,88,95,101,110,100,0,0,0,0,0,0,115,121,115,99,97,108,108,0,115,116,100,111,117,116,0,0,40,110,111,109,101,116,104,111,100,0,0,0,0,0,0,0,104,101,120,0,0,0,0,0,77,105,115,115,105,110,103,32,36,32,111,110,32,108,111,111,112,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,69,86,65,76,95,65,66,95,102,97,105,108,0,0,0,0,103,101,116,108,111,103,105,110,0,0,0,0,0,0,0,0,83,84,68,79,85,84,0,0,47,37,45,112,47,32,115,104,111,117,108,100,32,112,114,111,98,97,98,108,121,32,98,101,32,119,114,105,116,116,101,110,32,97,115,32,34,37,45,112,34,0,0,0,0,0,0,0,40,110,101,0,0,0,0,0,112,97,110,105,99,58,32,100,111,95,116,114,97,110,115,95,115,105,109,112,108,101,32,108,105,110,101,32,37,100,0,0,105,110,116,0,0,0,0,0,111,117,114,0,0,0,0,0,69,86,65,76,95,65,66,0,83,121,115,116,101,109,32,86,32,73,80,67,32,105,115,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,32,111,110,32,116,104,105,115,32,109,97,99,104,105,110,101,0,115,116,100,105,110,0,0,0,83,84,82,73,78,71,0,0,40,101,113,0,0,0,0,0,9,10,13,12,0,0,0,0,119,97,110,116,97,114,114,97,121,0,0,0,0,0,0,0,73,110,115,101,99,117,114,101,32,37,115,37,115,0,0,0,109,121,0,0,0,0,0,0,84,82,73,69,95,110,101,120,116,95,102,97,105,108,0,0,37,115,32,67,111,100,101,32,112,111,105,110,116,32,98,101,103,105,110,110,105,110,103,32,119,105,116,104,32,98,121,116,101,32,48,120,37,48,50,88,32,105,115,32,110,111,116,32,85,110,105,99,111,100,101,44,32,97,110,100,32,110,111,116,32,112,111,114,116,97,98,108,101,0,0,0,0,0,0,0,97,108,97,114,109,0,0,0,83,84,68,73,78,0,0,0,37,50,112,32,100,111,101,115,32,110,111,116,32,100,101,102,105,110,101,32,36,37,50,112,58,58,86,69,82,83,73,79,78,45,45,118,101,114,115,105,111,110,32,99,104,101,99,107,32,102,97,105,108,101,100,0,85,115,101,32,111,102,32,47,103,32,109,111,100,105,102,105,101,114,32,105,115,32,109,101,97,110,105,110,103,108,101,115,115,32,105,110,32,115,112,108,105,116,0,0,0,0,0,0,40,103,101,0,0,0,0,0,59,125,99,111,110,116,105,110,117,101,123,112,114,105,110,116,32,111,114,32,100,105,101,32,113,113,40,45,112,32,100,101,115,116,105,110,97,116,105,111,110,58,32,36,33,92,110,41,59,125,0,0,0,0,0,0,73,110,102,105,110,105,116,101,32,114,101,99,117,114,115,105,111,110,32,105,110,32,114,101,103,101,120,0,0,0,0,0,82,69,77,65,84,67,72,0,79,68,66,77,95,70,105,108,101,58,58,0,0,0,0,0,84,82,73,69,95,110,101,120,116,0,0,0,0,0,0,0,37,115,32,37,115,32,37,50,100,32,37,48,50,100,58,37,48,50,100,58,37,48,50,100,32,37,46,48,102,0,0,0,69,120,112,111,114,116,101,114,58,58,0,0,0,0,0,0,40,103,116,0,0,0,0,0,112,97,110,105,99,58,32,104,118,95,115,116,111,114,101,40,41,32,102,97,105,108,101,100,32,105,110,32,109,114,111,95,114,101,103,105,115,116,101,114,40,41,32,102,111,114,32,39,37,46,42,115,39,32,37,100,0,0,0,0,0,0,0,0,66,79,85,78,68,85,0,0,67,104,97,114,97,99,116,101,114,32,105,110,32,39,87,39,32,102,111,114,109,97,116,32,119,114,97,112,112,101,100,32,105,110,32,112,97,99,107,0,9,46,46,46,112,114,111,112,97,103,97,116,101,100,0,0,115,116,111,114,101,0,0,0,101,120,112,0,0,0,0,0,78,111,32,115,101,116,114,101,103,105,100,32,97,118,97,105,108,97,98,108,101,0,0,0,83,68,66,77,95,70,105,108,101,58,58,0,0,0,0,0,82,97,110,103,101,32,105,116,101,114,97,116,111,114,32,111,117,116,115,105,100,101,32,105,110,116,101,103,101,114,32,114,97,110,103,101,0,0,0,0,80,83,69,85,68,79,0,0,37,115,40,37,46,48,102,41,32,102,97,105,108,101,100,0,73,79,58,58,83,101,101,107,97,98,108,101,58,58,0,0,112,97,110,105,99,58,32,99,107,95,115,112,108,105,116,44,32,116,121,112,101,61,37,117,0,0,0,0,0,0,0,0,40,108,101,0,0,0,0,0,82,82,65,89,0,0,0,0,111,112,101,110,60,0,0,0,83,99,97,108,97,114,115,32,108,101,97,107,101,100,58,32,37,108,100,10,0,0,0,0,115,114,97,110,100,0,0,0,110,111,110,45,100,101,115,116,114,117,99,116,105,118,101,32,116,114,97,110,115,108,105,116,101,114,97,116,105,111,110,32,40,116,114,47,47,47,114,41,0,0,0,0,0,0,0,0,71,68,66,77,95,70,105,108,101,58,58,0,0,0,0,0,76,79,66,65,76,95,80,72,65,83,69,0,0,0,0,0,79,80,84,73,77,73,90,69,68,0,0,0,0,0,0,0,37,115,40,37,46,48,102,41,32,116,111,111,32,115,109,97,108,108,0,0,0,0,0,0,73,79,58,58,72,97,110,100,108,101,58,58,0,0,0,0,115,111,114,116,0,0,0,0,40,108,116,0,0,0,0,0,58,58,83,85,80,69,82,0,114,97,110,100,0,0,0,0,68,66,95,70,105,108,101,58,58,0,0,0,0,0,0,0,78,72,79,82,73,90,87,83,0,0,0,0,0,0,0,0,37,115,40,37,46,48,102,41,32,116,111,111,32,108,97,114,103,101,0,0,0,0,0,0,73,79,58,58,70,105,108,101,58,58,73,83,65,0,0,0,40,33,61,0,0,0,0,0,77,111,114,101,32,116,104,97,110,32,111,110,101,32,97,114,103,117,109,101,110,116,32,116,111,32,39,62,37,99,39,32,111,112,101,110,0,0,0,0,99,111,115,0,0,0,0,0,78,68,66,77,95,70,105,108,101,58,58,0,0,0,0,0,72,79,82,73,90,87,83,0,68,101,99,0,0,0,0,0,44,0,0,0,0,0,0,0,40,61,61,0,0,0,0,0,100,105,114,104,97,110,100,108,101,0,0,0,0,0,0,0,115,105,110,0,0,0,0,0,65,110,121,68,66,77,95,70,105,108,101,58,58,73,83,65,0,0,0,0,0,0,0,0,78,86,69,82,84,87,83,0,78,111,118,0,0,0,0,0,111,112,101,110,95,79,85,84,0,0,0,0,0,0,0,0,40,62,61,0,0,0,0,0,97,116,97,110,50,0,0,0,69,78,86,0,0,0,0,0,65,114,103,117,109,101,110,116,32,34,37,115,34,32,105,115,110,39,116,32,110,117,109,101,114,105,99,0,0,0,0,0,86,69,82,84,87,83,0,0,79,99,116,0,0,0,0,0,69,120,101,99,117,116,105,111,110,32,111,102,32,37,115,32,97,98,111,114,116,101,100,32,100,117,101,32,116,111,32,99,111,109,112,105,108,97,116,105,111,110,32,101,114,114,111,114,115,46,10,0,0,0,0,0,111,112,101,110,95,73,78,0,40,62,0,0,0,0,0,0,37,99,0,0,0,0,0,0,115,109,97,114,116,109,97,116,99,104,0,0,0,0,0,0,67,79,82,69,58,58,37,45,112,32,105,115,32,110,111,116,32,97,32,107,101,121,119,111,114,100,0,0,0,0,0,0,65,114,103,117,109,101,110,116,32,34,37,115,34,32,105,115])
.concat([110,39,116,32,110,117,109,101,114,105,99,32,105,110,32,37,115,0,0,0,0,0,0,0,76,78,66,82,69,65,75,0,83,101,112,0,0,0,0,0,37,115,32,104,97,100,32,99,111,109,112,105,108,97,116,105,111,110,32,101,114,114,111,114,115,46,10,0,0,0,0,0,100,101,102,105,110,101,100,40,37,37,104,97,115,104,41,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,40,60,61,0,0,0,0,0,112,97,110,105,99,58,32,100,111,95,116,114,97,110,115,95,99,111,117,110,116,32,108,105,110,101,32,37,100,0,0,0,99,111,109,112,108,101,109,101,110,116,0,0,0,0,0,0,37,42,115,58,58,68,65,84,65,0,0,0,0,0,0,0,115,118,95,50,105,118,32,97,115,115,117,109,101,100,32,40,85,95,86,40,102,97,98,115,40,40,100,111,117,98,108,101,41,83,118,78,86,88,40,115,118,41,41,41,32,60,32,40,85,86,41,73,86,95,77,65,88,41,32,98,117,116,32,83,118,78,86,88,40,115,118,41,61,37,103,32,85,95,86,32,105,115,32,48,120,37,108,120,44,32,73,86,95,77,65,88,32,105,115,32,48,120,37,108,120,10,0,0,0,0,0,0,75,69,69,80,83,0,0,0,65,117,103,0,0,0,0,0,9,40,77,97,121,98,101,32,121,111,117,32,115,104,111,117,108,100,32,106,117,115,116,32,111,109,105,116,32,116,104,101,32,100,101,102,105,110,101,100,40,41,63,41,10,0,0,0,40,60,0,0,0,0,0,0,112,117,115,104,109,97,114,107,0,0,0,0,0,0,0,0,110,111,116,0,0,0,0,0,109,97,105,110,0,0,0,0,73,83,65,0,0,0,0,0,67,85,84,71,82,79,85,80,0,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,74,117,108,0,0,0,0,0,80,69,82,76,95,83,73,71,78,65,76,83,32,105,108,108,101,103,97,108,58,32,34,37,115,34,0,0,0,0,0,0,40,117,110,100,101,102,41,0,100,101,102,105,110,101,100,40,64,97,114,114,97,121,41,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,40,105,110,116,0,0,0,0,37,37,69,78,86,32,105,115,32,97,108,105,97,115,101,100,32,116,111,32,37,37,37,115,37,115,0,0,0,0,0,0,105,95,110,101,103,97,116,101,0,0,0,0,0,0,0,0,78,85,76,76,82,69,70,0,204,128,0,0,0,0,0,0,37,108,100,0,0,0,0,0,37,50,112,58,58,37,50,112,0,0,0,0,0,0,0,0,67,79,77,77,73,84,0,0,74,117,110,0,0,0,0,0,116,101,109,112,111,114,97,114,121,0,0,0,0,0,0,0,115,97,102,101,0,0,0,0,112,97,110,105,99,58,32,99,107,95,103,114,101,112,44,32,116,121,112,101,61,37,117,0,40,60,62,0,0,0,0,0,66,79,85,78,68,76,0,0,67,104,97,114,97,99,116,101,114,32,105,110,32,39,67,39,32,102,111,114,109,97,116,32,119,114,97,112,112,101,100,32,105,110,32,112,97,99,107,0,80,82,79,80,65,71,65,84,69,0,0,0,0,0,0,0,110,101,103,97,116,101,0,0,78,111,32,115,101,116,114,101,117,105,100,32,97,118,97,105,108,97,98,108,101,0,0,0,65,109,98,105,103,117,111,117,115,32,117,115,101,32,111,102,32,37,99,32,114,101,115,111,108,118,101,100,32,97,115,32,111,112,101,114,97,116,111,114,32,37,99,0,0,0,0,0,58,58,95,95,65,78,79,78,95,95,0,0,0,0,0,0,83,75,73,80,0,0,0,0,77,97,121,0,0,0,0,0,114,101,97,100,111,110,108,121,32,118,97,108,117,101,0,0,117,110,115,97,102,101,0,0,40,110,101,103,0,0,0,0,69,120,112,108,105,99,105,116,32,98,108,101,115,115,105,110,103,32,116,111,32,39,39,32,40,97,115,115,117,109,105,110,103,32,112,97,99,107,97,103,101,32,109,97,105,110,41,0,111,112,101,110,62,0,0,0,85,110,98,97,108,97,110,99,101,100,32,115,116,114,105,110,103,32,116,97,98,108,101,32,114,101,102,99,111,117,110,116,58,32,40,37,108,100,41,32,102,111,114,32,34,37,115,34,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,112,97,100,95,102,114,101,101,32,112,111,0,0,0,0,0,0,98,105,116,95,111,114,0,0,110,111,110,45,100,101,115,116,114,117,99,116,105,118,101,32,115,117,98,115,116,105,116,117,116,105,111,110,32,40,115,47,47,47,114,41,0,0,0,0,79,112,101,114,97,116,111,114,32,111,114,32,115,101,109,105,99,111,108,111,110,32,109,105,115,115,105,110,103,32,98,101,102,111,114,101,32,37,99,37,45,112,0,0,0,0,0,0,68,69,83,84,82,79,89,32,99,114,101,97,116,101,100,32,110,101,119,32,114,101,102,101,114,101,110,99,101,32,116,111,32,100,101,97,100,32,111,98,106,101,99,116,32,39,37,50,112,39,0,0,0,0,0,0,78,67,79,68,73,78,71,0,67,97,110,39,116,32,99,97,108,108,32,109,114,111,95,109,101,116,104,111,100,95,99,104,97,110,103,101,100,95,105,110,40,41,32,111,110,32,97,110,111,110,121,109,111,117,115,32,115,121,109,98,111,108,32,116,97,98,108,101,0,0,0,0,77,65,82,75,80,79,73,78,84,0,0,0,0,0,0,0,65,112,114,0,0,0,0,0,112,97,110,105,99,58,32,114,101,102,99,111,117,110,116,101,100,95,104,101,95,102,101,116,99,104,95,112,118,110,32,98,97,100,32,102,108,97,103,115,32,37,108,120,0,0,0,0,67,97,110,39,116,32,114,101,116,117,114,110,32,97,32,37,115,32,102,114,111,109,32,108,118,97,108,117,101,32,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,0,0,80,69,82,76,95,83,73,71,78,65,76,83,0,0,0,0,67,79,82,69,58,58,71,76,79,66,65,76,58,58,103,108,111,98,0,0,0,0,0,0,40,97,98,115,0,0,0,0,98,105,116,95,120,111,114,0,63,0,0,0,0,0,0,0,95,95,65,78,79,78,95,95,58,58,95,95,65,78,79,78,95,95,0,0,0,0,0,0,80,82,85,78,69,0,0,0,77,97,114,0,0,0,0,0,67,97,110,39,116,32,114,101,116,117,114,110,32,37,115,32,102,114,111,109,32,108,118,97,108,117,101,32,115,117,98,114,111,117,116,105,110,101,0,0,0,58,117,116,102,56,0,0,40,61,0,0,0,0,0,0,77,111,114,101,32,116,104,97,110,32,111,110,101,32,97,114,103,117,109,101,110,116,32,116,111,32,39,37,99,38,39,32,111,112,101,110,0,0,0,0,78,69,71,65,84,73,86,69,95,73,78,68,73,67,69,83,0,0,0,0,0,0,0,0,69,88,84,69,78,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,71,0,0,0,97,0,0,0,103,0,0,0,16,255,0,0,26,255,0,0,33,255,0,0,39,255,0,0,65,255,0,0,71,255,0,0,22,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,9,0,0,0,14,0,0,0,32,0,0,0,33,0,0,0,133,0,0,0,134,0,0,0,160,0,0,0,161,0,0,0,128,22,0,0,129,22,0,0,14,24,0,0,15,24,0,0,0,32,0,0,11,32,0,0,40,32,0,0,42,32,0,0,47,32,0,0,48,32,0,0,95,32,0,0,96,32,0,0,0,48,0,0,1,48,0,0,4,0,0,0,0,0,0,0,186,114,112,63,0,0,0,0,32,0,0,0,127,0,0,0,160,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,9,0,0,0,10,0,0,0,32,0,0,0,33,0,0,0,160,0,0,0,161,0,0,0,128,22,0,0,129,22,0,0,14,24,0,0,15,24,0,0,0,32,0,0,11,32,0,0,47,32,0,0,48,32,0,0,95,32,0,0,96,32,0,0,0,48,0,0,1,48,0,0,24,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,9,0,0,0,11,0,0,0,12,0,0,0,14,0,0,0,32,0,0,0,33,0,0,0,133,0,0,0,134,0,0,0,160,0,0,0,161,0,0,0,128,22,0,0,129,22,0,0,14,24,0,0,15,24,0,0,0,32,0,0,11,32,0,0,40,32,0,0,42,32,0,0,47,32,0,0,48,32,0,0,95,32,0,0,96,32,0,0,0,48,0,0,1,48,0,0,6,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,10,0,0,0,14,0,0,0,133,0,0,0,134,0,0,0,40,32,0,0,42,32,0,0,67,97,110,110,111,116,32,109,111,100,105,102,121,32,115,104,97,114,101,100,32,115,116,114,105,110,103,32,116,97,98,108,101,32,105,110,32,104,118,95,37,115,0,0,0,0,0,0,61,33,60,44,62,0,0,0,67,97,110,39,116,32,117,115,101,32,115,116,114,105,110,103,32,40,34,37,45,51,50,112,34,37,115,41,32,97,115,32,37,115,32,114,101,102,32,119,104,105,108,101,32,34,115,116,114,105,99,116,32,114,101,102,115,34,32,105,110,32,117,115,101,0,0,0,0,0,0,0,103,118,46,99,0,0,0,0,133,204,136,204,129,0,0,0,185,204,136,204,129,0,0,0,45,120,0,0,0,0,0,0,84,97,114,103,101,116,32,111,102,32,103,111,116,111,32,105,115,32,116,111,111,32,100,101,101,112,108,121,32,110,101,115,116,101,100,0,0,0,0,0,65,85,84,79,76,79,65,68,0,0,0,0,0,0,0,0,32,78,79,95,77,65,84,72,79,77,83,32,80,69,82,76,95,68,79,78,84,95,67,82,69,65,84,69,95,71,86,83,86,32,80,69,82,76,95,80,82,69,83,69,82,86,69,95,73,86,85,86,32,80,69,82,76,95,85,83,69,95,83,65,70,69,95,80,85,84,69,78,86,32,85,83,69,95,80,69,82,76,95,65,84,79,70,0,6,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,71,0,0,0,97,0,0,0,103,0,0,0,8,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,91,0,0,0,95,0,0,0,96,0,0,0,97,0,0,0,123,0,0,0,2,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,65,0,0,0,91,0,0,0,4,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,9,0,0,0,14,0,0,0,32,0,0,0,33,0,0,0,8,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,33,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,91,0,0,0,97,0,0,0,123,0,0,0,127,0,0,0,2,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,32,0,0,0,127,0,0,0,2,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,97,0,0,0,123,0,0,0,2,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,33,0,0,0,127,0,0,0,2,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,48,0,0,0,58,0,0,0,4,0,0,0,0,0,0,0,186,114,112,63,0,0,0,0,32,0,0,0,127,0,0,0,128,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,9,0,0,0,10,0,0,0,32,0,0,0,33,0,0,0,4,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,65,0,0,0,91,0,0,0,97,0,0,0,123,0,0,0,6,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,91,0,0,0,97,0,0,0,123,0,0,0,80,147,0,0,144,126,0,0,64,23,1,0,8,100,0,0,0,0,0,0,0,0,0,0,40,110,117,108,108,41,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,48,64,78,117,109,98,101,114,32,116,111,111,32,108,111,110,103,0,192,244,0,0,88,254,0,0,192,244,0,0,192,253,0,0,112,253,0,0,0,0,0,0,192,244,0,0,0,2,1,0,192,244,0,0,192,1,1,0,104,1,1,0,0,0,0,0,192,244,0,0,8,1,1,0,192,244,0,0,16,0,1,0,64,255,0,0,0,0,0,0,37,49,50,51,52,53,54,55,56,57,65,66,67,68,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,110,32,65,82,82,65,89,0,0,0,0,0,0,0,0,97,32,72,65,83,72,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,32,100,117,114,105,110,103,32,115,116,114,105,110,103,32,101,120,116,101,110,100,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,32,100,117,114,105,110,103,32,108,105,115,116,32,101,120,116,101,110,100,0,0,0,0,0,0,0,0,103,111,116,111,32,109,117,115,116,32,104,97,118,101,32,108,97,98,101,108,0,0,0,0,56,66,0,0,168,65,0,0,184,29,1,0,240,28,1,0,80,27,1,0,104,26,1,0,176,25,1,0,48,25,1,0,40,24,1,0,112,23,1,0,24,23,1,0,200,22,1,0,152,71,0,0,0,70,0,0,24,69,0,0,40,68,0,0,208,67,0,0,72,67,0,0,192,66,0,0,0,0,0,0,66,69,71,73,78,32,110,111,116,32,115,97,102,101,32,97,102,116,101,114,32,101,114,114,111,114,115,45,45,99,111,109,112,105,108,97,116,105,111,110,32,97,98,111,114,116,101,100,0,0,0,0,0,0,0,0,73,110,105,116,105,97,108,105,122,97,116,105,111,110,32,111,102,32,115,116,97,116,101,32,118,97,114,105,97,98,108,101,115,32,105,110,32,108,105,115,116,32,99,111,110,116,101,120,116,32,99,117,114,114,101,110,116,108,121,32,102,111,114,98,105,100,100,101,110,0,0,0,84,104,101,32,115,116,97,116,32,112,114,101,99,101,100,105,110,103,32,45,108,32,95,32,119,97,115,110,39,116,32,97,110,32,108,115,116,97,116,0,102,101,97,116,117,114,101,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,114,111,46,99,0,0,0,117,110,105,118,101,114,115,97,108,46,99,0,0,0,0,0,6,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,9,0,0,0,11,0,0,0,12,0,0,0,14,0,0,0,32,0,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,85,115,101,32,111,102,32,117,110,105,110,105,116,105,97,108,105,122,101,100,32,118,97,108,117,101,37,45,112,37,115,37,115,0,0,0,0,0,0,0,85,115,101,32,111,102,32,117,110,105,110,105,116,105,97,108,105,122,101,100,32,118,97,108,117,101,37,115,37,115,37,115,0,0,0,0,0,0,0,0,85,110,113,117,111,116,101,100,32,115,116,114,105,110,103,32,34,37,115,34,32,109,97,121,32,99,108,97,115,104,32,119,105,116,104,32,102,117,116,117,114,101,32,114,101,115,101,114,118,101,100,32,119,111,114,100,0,0,0,0,0,0,0,0,83,101,109,105,99,111,108,111,110,32,115,101,101,109,115,32,116,111,32,98,101,32,109,105,115,115,105,110,103,0,0,0,85,110,115,117,99,99,101,115,115,102,117,108,32,37,115,32,111,110,32,102,105,108,101,110,97,109,101,32,99,111,110,116,97,105,110,105,110,103,32,110,101,119,108,105,110,101,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,224,0,254,252,207,4,0,0,0,0,0,96,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,5,5,5,5,6,6,7,13,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,98,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,167,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,188,255,255,31,0,0,0,0,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,1,0,0,0,0,0,0,47,98,105,110,47,115,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,6,6,6,6,9,9,9,9,13,13,13,13,17,18,18,18,21,21,23,23,23,23,27,27,27,27,31,31,31,31,35,35,35,35,39,39,39,42,42,42,45,46,47,48,48,48,48,48,48,48,55,55,57,58,59,59,59,59,63,64,65,66,66,66,66,66,66,66,66,66,66,82,82,82,82,80,81,82,83,84,85,82,87,87,87,87,91,92,93,94,95,96,96,96,99,99,99,99,99,99,105,106,107,108,109,110,55,112,87,87,83,83,62,62,63,63,63,63,63,63,63,63,63,63,46,46,61,61,61,61,76,76,59,59,59,59,59,59,103,103,101,101,102,102,104,104,105,105,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,72,0,0,24,8,1,0,200,215,0,0,144,178,0,0,248,149,0,0,16,128,0,0,160,112,0,0,72,101,0,0,224,79,0,0,80,69,0,0,168,26,1,0,104,20,1,0,104,13,1,0,104,5,1,0,136,255,0,0,96,250,0,0,208,245,0,0,192,241,0,0,160,237,0,0,80,233,0,0,0,229,0,0,104,223,0,0,200,218,0,0,120,214,0,0,8,209,0,0,232,203,0,0,8,199,0,0,80,194,0,0,128,190,0,0,72,187,0,0,208,184,0,0,136,182,0,0,144,179,0,0,88,177,0,0,200,172,0,0,0,168,0,0,88,166,0,0,168,164,0,0,136,162,0,0,48,160,0,0,216,157,0,0,24,155,0,0,184,151,0,0,152,148,0,0,200,145,0,0,144,143,0,0,168,141,0,0,136,139,0,0,8,137,0,0,24,135,0,0,96,133,0,0,104,131,0,0,216,128,0,0,32,127,0,0,104,125,0,0,8,124,0,0,240,122,0,0,64,121,0,0,72,119,0,0,144,117,0,0,24,116,0,0,96,115,0,0,152,113,0,0,72,112,0,0,192,110,0,0,224,109,0,0,96,125,0,0,48,107,0,0,128,106,0,0,48,105,0,0,152,104,0,0,104,103,0,0,240,101,0,0,184,100,0,0,240,98,0,0,56,96,0,0,120,93,0,0,160,90,0,0,16,88,0,0,8,86,0,0,40,84,0,0,176,82,0,0,232,80,0,0,88,79,0,0,24,78,0,0,72,77,0,0,128,76,0,0,176,75,0,0,192,74,0,0,224,73,0,0,208,72,0,0,144,71,0,0,248,69,0,0,16,69,0,0,32,68,0,0,200,67,0,0,64,67,0,0,184,66,0,0,48,66,0,0,160,65,0,0,176,29,1,0,224,28,1,0,72,27,1,0,96,26,1,0,152,25,1,0,40,25,1,0,32,24,1,0,104,23,1,0,16,23,1,0,192,22,1,0,64,22,1,0,216,21,1,0,8,21,1,0,224,19,1,0,144,18,1,0,16,18,1,0,128,17,1,0,40,17,1,0,128,16,1,0,48,16,1,0,136,15,1,0,144,14,1,0,248,13,1,0,48,13,1,0,48,11,1,0,200,10,1,0,32,10,1,0,160,9,1,0,88,9,1,0,224,8,1,0,32,8,1,0,8,7,1,0,56,6,1,0,32,5,1,0,16,4,1,0,40,3,1,0,208,2,1,0,128,2,1,0,8,2,1,0,200,1,1,0,120,1,1,0,40,1,1,0,48,0,1,0,80,255,0,0,128,254,0,0,208,253,0,0,128,253,0,0,72,253,0,0,8,253,0,0,168,252,0,0,40,252,0,0,104,251,0,0,160,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,4,0,0,176,1,0,0,42,4,0,0,208,3,0,0,184,1,0,0,86,1,0,0,56,3,0,0,40,0,0,0,24,0,0,0,80,1,0,0,160,1,0,0,142,1,0,0,58,0,0,0,60,0,0,0,246,2,0,0,72,1,0,0,52,0,0,0,116,3,0,0,142,3,0,0,56,1,0,0,160,0,0,0,148,1,0,0,246,0,0,0,50,0,0,0,188,0,0,0,4,2,0,0,128,2,0,0,2,0,0,0,42,4,0,0,44,0,0,0,20,1,0,0,180,3,0,0,12,1,0,0,14,1,0,0,160,2,0,0,34,4,0,0,34,4,0,0,152,3,0,0,150,1,0,0,162,3,0,0,92,3,0,0,162,3,0,0,92,3,0,0,118,0,0,0,8,4,0,0,220,0,0,0,32,0,0,0,134,2,0,0,134,2,0,0,134,2,0,0,134,2,0,0,138,2,0,0,138,2,0,0,138,2,0,0,138,2,0,0,38,0,0,0,108,0,0,0,122,3,0,0,12,2,0,0,94,1,0,0,252,1,0,0,72,2,0,0,70,1,0,0,166,2,0,0,46,4,0,0,238,0,0,0,140,2,0,0,206,1,0,0,98,0,0,0,138,0,0,0,142,2,0,0,4,0,0,0,234,1,0,0,186,0,0,0,250,1,0,0,14,0,0,0,222,1,0,0,22,0,0,0,254,1,0,0,124,2,0,0,48,0,0,0,232,1,0,0,88,3,0,0,70,2,0,0,224,1,0,0,114,0,0,0,114,0,0,0,114,0,0,0,114,0,0,0,62,2,0,0,100,2,0,0,68,1,0,0,136,3,0,0,102,2,0,0,102,2,0,0,164,3,0,0,140,1,0,0,234,2,0,0,154,1,0,0,30,4,0,0,100,0,0,0,206,3,0,0,206,3,0,0,76,1,0,0,128,1,0,0,206,3,0,0,206,3,0,0,206,3,0,0,244,1,0,0,126,3,0,0,126,3,0,0,124,3,0,0,154,0,0,0,18,3,0,0,78,3,0,0,170,0,0,0,170,0,0,0,62,3,0,0,216,2,0,0,242,2,0,0,148,0,0,0,44,4,0,0,132,1,0,0,132,1,0,0,116,0,0,0,20,0,0,0,244,0,0,0,40,1,0,0,192,2,0,0,192,2,0,0,62,0,0,0,36,1,0,0,182,2,0,0,60,2,0,0,60,2,0,0,106,1,0,0,12,4,0,0,12,4,0,0,118,2,0,0,180,2,0,0,40,1,0,0,212,3,0,0,30,1,0,0,190,2,0,0,96,2,0,0,236,2,0,0,74,2,0,0,80,2,0,0,124,1,0,0,112,0,0,0,136,2,0,0,50,1,0,0,158,0,0,0,250,0,0,0,180,1,0,0,180,1,0,0,102,1,0,0,174,1,0,0,2,4,0,0,22,3,0,0,156,0,0,0,58,0,0,0,70,0,0,0,22,4,0,0,122,1,0,0,22,2,0,0,240,1,0,0,100,3,0,0,88,0,0,0,118,0,0,0,74,0,0,0,240,1,0,0,100,3,0,0,118,0,0,0,214,3,0,0,26,1,0,0,196,1,0,0,210,2,0,0,200,3,0,0,20,3,0,0,18,0,0,0,10,2,0,0,42,4,0,0,0,3,0,0,56,2,0,0,236,0,0,0,38,4,0,0,144,2,0,0,42,4,0,0,52,1,0,0,232,2,0,0,244,2,0,0,36,0,0,0,24,1,0,0,134,3,0,0,54,2,0,0,146,2,0,0,172,0,0,0,172,0,0,0,216,3,0,0,130,0,0,0,48,1,0,0,202,1,0,0,138,3,0,0,194,1,0,0,64,3,0,0,238,1,0,0,104,0,0,0,244,3,0,0,188,1,0,0,170,2,0,0,42,3,0,0,162,2,0,0,70,3,0,0,220,1,0,0,96,1,0,0,168,1,0,0,220,1,0,0,106,3,0,0,226,3,0,0,112,2,0,0,132,0,0,0,146,3,0,0,18,1,0,0,214,2,0,0,128,0,0,0,128,0,0,0,64,2,0,0,104,3,0,0,132,0,0,0,54,3,0,0,8,1,0,0,192,3,0,0,104,3,0,0,164,0,0,0,176,2,0,0,176,2,0,0,90,1,0,0,58,0,0,0,58,0,0,0,58,0,0,0,56,0,0,0,58,0,0,0,58,0,0,0,58,0,0,0,58,0,0,0,58,0,0,0,58,0,0,0,58,0,0,0,58,0,0,0,58,0,0,0,192,1,0,0,192,1,0,0,66,2,0,0,66,2,0,0,66,2,0,0,66,2,0,0,66,2,0,0,66,2,0,0,56,4,0,0,56,4,0,0,56,4,0,0,56,4,0,0,56,4,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,194,3,0,0,4,1,0,0,30,0,0,0,118,3,0,0,118,3,0,0,66,0,0,0,44,3,0,0,172,1,0,0,44,3,0,0,44,3,0,0,44,3,0,0,144,0,0,0,120,3,0,0,120,3,0,0,130,2,0,0,120,2,0,0,160,3,0,0,12,0,0,0,172,3,0,0,72,0,0,0,184,2,0,0,178,3,0,0,4,3,0,0,234,3,0,0,86,3,0,0,4,4,0,0,104,1,0,0,0,1,0,0,44,3,0,0,152,2,0,0,248,0,0,0,144,3,0,0,88,2,0,0,124,0,0,0,98,2,0,0,200,2,0,0,82,0,0,0,82,0,0,0,78,2,0,0,36,3,0,0,38,1,0,0,200,1,0,0,46,3,0,0,46,3,0,0,38,1,0,0,200,1,0,0,46,3,0,0,46,3,0,0,46,3,0,0,38,1,0,0,200,1,0,0,240,0,0,0,240,0,0,0,122,2,0,0,178,1,0,0,82,1,0,0,66,3,0,0,188,3,0,0,126,0,0,0,126,0,0,0,126,0,0,0,198,0,0,0,198,0,0,0,198,0,0,0,62,1,0,0,62,1,0,0,62,1,0,0,248,1,0,0,248,1,0,0,248,1,0,0,224,2,0,0,224,2,0,0,224,2,0,0,224,2,0,0,48,4,0,0,48,4,0,0,48,4,0,0,48,4,0,0,200,0,0,0,200,0,0,0,200,0,0,0,48,4,0,0,48,4,0,0,90,0,0,0,90,0,0,0,90,0,0,0,48,4,0,0,48,4,0,0,120,1,0,0,130,1,0,0,154,2,0,0,28,1,0,0,58,0,0,0,60,1,0,0,60,1,0,0,60,1,0,0,10,0,0,0,122,0,0,0,94,3,0,0,0,0,0,0,0,0,0,0,128,138,0,0,32,253,0,0,128,129,0,0,40,153,0,0,192,144,0,0,72,72,0,0,56,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,158,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,27,0,0,4,0,0,0,4,0,0,0,4,6,0,0,68,6,0,0,68,6,0,0,64,18,1,0,68,0,0,0,64,0,0,0,64,0,0,0,64,0,0,0,64,5,0,0,68,1,0,0,68,1,0,0,4,1,0,0,64,1,0,0,0,6,0,0,4,27,0,0,1,33,0,0,6,17,0,0,140,155,0,0,4,20,9,0,136,155,0,0,8,148,0,0,8,235,0,0,8,6,0,0,4,17,0,0,4,17,0,0,4,19,0,0,64,5,0,0,4,5,0,0,68,21,0,0,68,3,0,0,4,24,0,0,4,24,0,0,4,0,0,0,8,34,2,0,13,43,0,0,140,155,0,0,29,43,0,0,156,155,0,0,132,155,0,0,4,155,0,0,132,155,0,0,140,155,0,0,100,17,0,0,68,17,0,0,100,17,0,0,68,17,0,0,108,17,0,0,92,17,0,0,108,17,0,0,92,17,0,0,30,18,1,0,62,18,1,0,30,18,1,0,62,18,1,0,30,18,1,0,62,18,1,0,30,18,1,0,9,34,1,0,62,18,1,0,30,18,1,0,62,18,1,0,30,18,1,0,30,18,1,0,30,20,0,0,30,18,1,0,30,18,1,0,38,18,1,0,6,18,1,0,38,18,1,0,6,18,1,0,38,18,1,0,6,18,1,0,38,18,1,0,6,18,1,0,38,18,1,0,6,18,1,0,38,18,1,0,6,18,1,0,46,18,1,0,14,18,1,0,6,18,1,0,6,18,1,0,6,18,1,0,6,18,1,0,6,18,1,0,6,18,1,0,14,18,1,0,14,18,1,0,14,18,1,0,14,18,1,0,46,17,0,0,30,17,0,0,6,17,0,0,14,17,0,0,4,2,0,0,30,20,1,0,158,155,0,0,158,155,0,0,28,155,0,0,28,155,0,0,158,155,0,0,158,155,0,0,158,155,0,0,158,155,0,0,158,155,0,0,158,155,0,0,158,155,0,0,158,155,0,0,12,20,145,9,12,20,17,0,28,20,145,0,28,20,145,0,15,20,2,0,5,20,2,0,158,155,0,0,158,155,0,0,30,20,1,0,142,155,0,0,142,155,0,0,142,155,0,0,142,155,0,0,142,155,0,0,72,1,0,0,4,54,1,0,64,48,1,0,4,50,1,0,1,52,2,0,0,59,0,0,8,59,0,0,8,59,0,0,0,75,0,0,8,75,0,0,8,75,0,0,0,27,0,0,4,27,0,0,72,1,0,0,4,66,1,0,1,68,2,0,0,75,0,0,128,20,9,0,13,20,2,0,8,20,17,0,13,20,2,0,1,36,0,0,0,66,34,0,5,36,0,0,5,36,0,0,1,52,153,2,29,52,2,0,4,187,0,0,4,187,0,0,29,52,2,0,65,212,2,0,9,36,0,0,65,84,2,0,72,3,0,0,65,84,2,0,72,3,0,0,0,19,1,0,0,17,1,0,0,1,0,0,0,3,0,0,0,3,0,0,6,18,1,0,0,3,0,0,64,3,0,0,4,3,0,0,4,3,0,0,4,3,0,0,64,1,0,0,73,33,0,0,0,1,0,0,0,1,0,0,8,155,0,0,13,36,0,0,77,36,0,0,4,155,0,0,0,4,0,0,4,10,0,0,4,10,0,0,4,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,64,9,0,0,0,0,0,0,64,9,0,0,0,2,0,0,65,36,0,0,68,13,0,0,68,13,0,0,68,13,0,0,68,13,0,0,68,13,0,0,68,155,0,0,64,6,0,0,64,3,0,0,0,1,0,0,64,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,13,100,41,0,4,235,0,0,4,100,6,0,12,107,0,0,12,155,0,0,4,100,9,0,69,116,33,0,4,123,0,0,4,123,0,0,4,68,17,0,4,75,0,0,8,20,17,1,12,228,0,0,12,235,0,0,13,100,23,9,68,235,0,0,0,1,0,0,5,228,2,0,5,228,2,0,5,228,2,0,4,100,17,9,4,100,17,0,13,100,23,9,13,100,145,9,4,235,0,0,12,235,0,0,4,100,17,0,4,20,1,0,12,100,17,0,12,100,17,0,28,100,1,0,13,100,17,9,13,100,23,1,4,100,17,1,4,100,22,17,4,100,1,0,4,100,1,0,4,100,1,0,12,100,6,0,12,100,1,0,4,100,17,0,4,100,17,1,4,107,0,0,4,107,0,0,128,236,0,0,128,236,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,140,108,0,0,140,108,0,0,140,108,0,0,140,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,132,108,0,0,4,108,0,0,132,108,0,0,132,108,0,0,28,155,0,0,29,36,0,0,156,155,0,0,157,36,0,0,29,36,0,0,29,36,0,0,28,20,1,0,28,20,1,0,28,20,1,0,140,155,0,0,156,148,9,0,156,155,0,0,4,100,1,0,0,107,0,0,12,107,0,0,4,100,1,0,4,107,0,0,4,107,0,0,12,0,0,0,28,0,0,0,28,20,1,0,29,148,2,0,93,148,2,0,93,36,0,0,28,0,0,0,28,155,0,0,28,148,9,0,28,20,1,0,28,20,17,0,28,0,0,0,0,0,0,0,8,155,0,0,8,155,0,0,140,155,0,0,28,155,0,0,13,20,17,0,13,20,17,0,13,20,17,1,13,20,17,1,13,20,1,0,13,20,17,0,13,20,17,0,13,20,17,17,13,20,1,0,13,20,17,0,13,20,17,1,192,155,0,0,64,17,0,0,4,6,0,0,192,155,0,0,0,17,0,0,64,3,0,0,0,4,0,0,0,27,0,0,0,20,1,0,0,0,0,0,0,27,0,0,0,20,1,0,0,0,0,0,0,27,0,0,0,20,0,0,0,0,0,0,0,20,1,0,0,20,1,0,0,0,0,0,4,27,0,0,4,27,0,0,4,27,0,0,4,27,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,27,0,0,0,27,0,0,0,0,0,0,4,0,0,0,4,0,0,0,0,27,0,0,0,27,0,0,0,0,0,0,4,0,0,0,4,0,0,0,12,0,0,0,13,20,2,0,4,123,0,0,0,3,0,0,0,0,0,0,0,27,0,0,8,27,0,0,8,27,0,0,0,6,0,0,4,0,0,0,142,155,0,0,96,98,0,0,208,77,0,0,240,10,1,0,112,25,1,0,104,18,1,0,0,11,1,0,112,3,1,0,24,254,0,0,8,249,0,0,184,244,0,0,216,240,0,0,8,236,0,0,24,232,0,0,120,227,0,0,96,222,0,0,168,217,0,0,56,213,0,0,56,208,0,0,120,202,0,0,208,197,0,0,224,193,0,0,40,189,0,0,192,186,0,0,16,184,0,0,224,1,1,0,104,128,0,0,40,184,0,0,40,171,0,0,80,167,0,0,184,165,0,0,200,235,0,0,224,161,0,0,64,203,0,0,72,157,0,0,80,154,0,0,224,150,0,0,152,147,0,0,16,145,0,0,216,142,0,0,16,141,0,0,216,138,0,0,96,136,0,0,120,134,0,0,128,132,0,0,216,126,0,0,160,82,0,0,176,126,0,0,216,124,0,0,176,123,0,0,104,122,0,0,112,120,0,0,216,118,0,0,232,116,0,0,200,115,0,0,184,114,0,0,48,113,0,0,208,111,0,0,88,110,0,0,80,109,0,0,40,108,0,0,232,106,0,0,168,105,0,0,184,104,0,0,96,104,0,0,216,102,0,0,128,101,0,0,24,100,0,0,104,98,0,0,144,95,0,0,248,92,0,0,40,90,0,0,176,87,0,0,200,85,0,0,96,83,0,0,56,82,0,0,104,80,0,0,0,79,0,0,216,77,0,0,8,77,0,0,32,76,0,0,88,75,0,0,96,74,0,0])
.concat([112,73,0,0,64,72,0,0,232,70,0,0,128,69,0,0,152,68,0,0,248,67,0,0,152,67,0,0,240,66,0,0,112,66,0,0,208,65,0,0,104,65,0,0,136,29,1,0,0,28,1,0,232,26,1,0,40,26,1,0,128,25,1,0,152,24,1,0,200,23,1,0,56,23,1,0,240,22,1,0,168,22,1,0,40,22,1,0,128,21,1,0,176,20,1,0,216,191,0,0,80,188,0,0,0,18,1,0,88,17,1,0,24,17,1,0,96,16,1,0,24,16,1,0,64,15,1,0,88,14,1,0,168,13,1,0,128,12,1,0,8,11,1,0,168,10,1,0,248,9,1,0,152,9,1,0,48,9,1,0,192,8,1,0,8,8,1,0,200,6,1,0,144,5,1,0,184,4,1,0,120,3,1,0,240,2,1,0,184,2,1,0,96,2,1,0,248,1,1,0,184,1,1,0,96,1,1,0,208,0,1,0,248,255,0,0,32,255,0,0,40,254,0,0,72,234,0,0,104,253,0,0,40,253,0,0,224,252,0,0,128,252,0,0,208,251,0,0,8,229,0,0,88,233,0,0,192,249,0,0,16,249,0,0,240,248,0,0,160,248,0,0,32,248,0,0,216,247,0,0,160,247,0,0,64,247,0,0,184,246,0,0,40,246,0,0,72,245,0,0,16,22,1,0,152,244,0,0,48,244,0,0,240,243,0,0,184,243,0,0,136,243,0,0,56,243,0,0,184,242,0,0,24,242,0,0,104,241,0,0,224,240,0,0,200,240,0,0,136,240,0,0,72,240,0,0,8,240,0,0,168,239,0,0,64,239,0,0,56,119,0,0,216,237,0,0,8,237,0,0,16,236,0,0,160,235,0,0,96,235,0,0,64,235,0,0,24,235,0,0,248,234,0,0,136,234,0,0,0,234,0,0,104,233,0,0,192,232,0,0,32,232,0,0,80,219,0,0,200,231,0,0,128,231,0,0,88,231,0,0,56,231,0,0,224,230,0,0,48,230,0,0,24,229,0,0,128,228,0,0,128,227,0,0,16,227,0,0,184,226,0,0,144,226,0,0,56,226,0,0,208,225,0,0,128,225,0,0,128,224,0,0,176,223,0,0,152,222,0,0,8,110,0,0,224,221,0,0,128,221,0,0,72,221,0,0,224,220,0,0,152,220,0,0,32,220,0,0,88,219,0,0,232,218,0,0,48,218,0,0,176,217,0,0,104,217,0,0,16,217,0,0,0,217,0,0,224,216,0,0,80,216,0,0,160,215,0,0,72,215,0,0,144,82,0,0,88,253,0,0,72,213,0,0,240,212,0,0,200,212,0,0,88,212,0,0,192,211,0,0,96,211,0,0,240,210,0,0,24,123,0,0,120,209,0,0,192,208,0,0,96,208,0,0,200,207,0,0,56,207,0,0,16,179,0,0,176,206,0,0,104,206,0,0,240,205,0,0,80,205,0,0,8,204,0,0,72,203,0,0,136,202,0,0,80,202,0,0,24,202,0,0,112,201,0,0,232,200,0,0,80,112,0,0,88,200,0,0,192,199,0,0,32,199,0,0,160,198,0,0,224,197,0,0,144,197,0,0,104,197,0,0,248,196,0,0,136,196,0,0,96,196,0,0,176,195,0,0,88,195,0,0,128,194,0,0,32,194,0,0,232,193,0,0,208,193,0,0,160,193,0,0,96,193,0,0,232,192,0,0,200,192,0,0,120,192,0,0,0,192,0,0,192,190,0,0,48,190,0,0,48,189,0,0,24,189,0,0,240,188,0,0,56,105,0,0,208,188,0,0,112,103,0,0,176,188,0,0,88,188,0,0,144,187,0,0,248,101,0,0,200,186,0,0,184,186,0,0,168,186,0,0,192,100,0,0,96,99,0,0,24,186,0,0,184,185,0,0,168,90,0,0,24,88,0,0,16,86,0,0,24,184,0,0,248,183,0,0,224,183,0,0,208,183,0,0,184,82,0,0,96,79,0,0,152,183,0,0,88,78,0,0,176,182,0,0,32,182,0,0,208,181,0,0,184,181,0,0,128,181,0,0,120,181,0,0,240,73,0,0,224,72,0,0,240,18,1,0,120,180,0,0,192,179,0,0,88,179,0,0,8,179,0,0,240,178,0,0,216,178,0,0,200,178,0,0,184,178,0,0,160,178,0,0,136,178,0,0,72,178,0,0,136,177,0,0,168,115,0,0,168,176,0,0,80,176,0,0,48,2,1,0,152,175,0,0,64,175,0,0,8,175,0,0,152,174,0,0,232,173,0,0,8,173,0,0,208,171,0,0,72,171,0,0,248,170,0,0,216,170,0,0,88,170,0,0,24,170,0,0,200,169,0,0,120,169,0,0,216,168,0,0,48,168,0,0,144,167,0,0,96,167,0,0,56,167,0,0,40,167,0,0,32,167,0,0,16,167,0,0,0,167,0,0,248,166,0,0,240,166,0,0,128,166,0,0,64,166,0,0,200,165,0,0,176,165,0,0,168,165,0,0,160,165,0,0,152,165,0,0,144,165,0,0,144,17,1,0,56,17,1,0,216,164,0,0,104,164,0,0,56,164,0,0,48,164,0,0,40,164,0,0,32,164,0,0,16,164,0,0,8,164,0,0,224,163,0,0,0,0,0,0,0,0,0,0,144,163,0,0,208,77,0,0,240,10,1,0,112,25,1,0,104,18,1,0,200,162,0,0,104,162,0,0,232,161,0,0,208,161,0,0,184,161,0,0,168,161,0,0,152,161,0,0,136,161,0,0,120,161,0,0,48,161,0,0,88,160,0,0,8,160,0,0,176,159,0,0,152,159,0,0,128,159,0,0,104,159,0,0,80,159,0,0,56,159,0,0,16,184,0,0,16,159,0,0,104,128,0,0,200,158,0,0,0,158,0,0,184,157,0,0,80,157,0,0,48,157,0,0,24,157,0,0,0,157,0,0,232,156,0,0,208,156,0,0,176,156,0,0,176,156,0,0,112,156,0,0,88,155,0,0,16,141,0,0,192,154,0,0,96,136,0,0,120,154,0,0,16,154,0,0,0,154,0,0,160,82,0,0,240,153,0,0,152,153,0,0,120,153,0,0,248,152,0,0,128,152,0,0,232,151,0,0,64,151,0,0,232,150,0,0,168,150,0,0,144,150,0,0,120,150,0,0,88,150,0,0,8,150,0,0,224,149,0,0,128,149,0,0,192,148,0,0,80,148,0,0,200,147,0,0,128,147,0,0,112,147,0,0,88,147,0,0,48,147,0,0,40,147,0,0,16,147,0,0,128,146,0,0,8,146,0,0,136,145,0,0,24,145,0,0,0,145,0,0,240,144,0,0,200,144,0,0,168,144,0,0,152,144,0,0,136,144,0,0,24,144,0,0,200,143,0,0,88,143,0,0,224,142,0,0,184,142,0,0,168,142,0,0,152,142,0,0,136,142,0,0,120,142,0,0,80,142,0,0,56,142,0,0,208,141,0,0,120,141,0,0,24,141,0,0,0,141,0,0,240,140,0,0,216,140,0,0,128,25,1,0,192,140,0,0,176,140,0,0,56,23,1,0,240,22,1,0,168,22,1,0,40,22,1,0,128,21,1,0,176,20,1,0,216,191,0,0,80,188,0,0,0,18,1,0,88,17,1,0,24,17,1,0,96,16,1,0,24,16,1,0,64,15,1,0,88,14,1,0,168,13,1,0,128,12,1,0,8,11,1,0,168,10,1,0,248,9,1,0,152,9,1,0,48,9,1,0,192,8,1,0,8,8,1,0,200,6,1,0,144,5,1,0,184,4,1,0,152,140,0,0,24,140,0,0,152,139,0,0,64,139,0,0,224,138,0,0,200,138,0,0,184,138,0,0,168,138,0,0,248,255,0,0,32,255,0,0,40,254,0,0,72,234,0,0,104,253,0,0,144,138,0,0,112,138,0,0,96,138,0,0,208,251,0,0,8,229,0,0,88,233,0,0,192,249,0,0,80,138,0,0,240,248,0,0,216,137,0,0,64,137,0,0,200,136,0,0,160,247,0,0,64,247,0,0,184,246,0,0,40,246,0,0,72,245,0,0,16,22,1,0,152,244,0,0,104,136,0,0,80,136,0,0,72,136,0,0,56,136,0,0,40,136,0,0,24,136,0,0,8,136,0,0,216,135,0,0,80,135,0,0,216,134,0,0,128,134,0,0,96,134,0,0,64,134,0,0,32,134,0,0,0,134,0,0,232,133,0,0,88,12,1,0,200,133,0,0,112,133,0,0,160,235,0,0,96,235,0,0,64,235,0,0,232,132,0,0,136,132,0,0,112,132,0,0,88,132,0,0,64,132,0,0,48,132,0,0,32,132,0,0,0,132,0,0,192,131,0,0,176,130,0,0,160,130,0,0,40,130,0,0,224,230,0,0,48,230,0,0,24,229,0,0,128,228,0,0,128,227,0,0,16,227,0,0,184,226,0,0,240,129,0,0,232,129,0,0,208,129,0,0,192,129,0,0,168,129,0,0,176,223,0,0,152,222,0,0,8,110,0,0,224,221,0,0,96,233,0,0,72,221,0,0,224,220,0,0,152,220,0,0,32,220,0,0,88,219,0,0,232,218,0,0,48,218,0,0,176,217,0,0,48,129,0,0,16,217,0,0,0,217,0,0,224,216,0,0,224,181,0,0,152,128,0,0,112,128,0,0,144,82,0,0,88,253,0,0,72,213,0,0,240,212,0,0,200,212,0,0,88,212,0,0,192,211,0,0,96,211,0,0,240,210,0,0,24,123,0,0,120,209,0,0,192,208,0,0,96,208,0,0,200,207,0,0,56,207,0,0,16,179,0,0,32,116,0,0,104,206,0,0,240,205,0,0,80,205,0,0,8,204,0,0,72,203,0,0,88,128,0,0,72,128,0,0,24,202,0,0,112,201,0,0,232,200,0,0,80,112,0,0,64,128,0,0,24,128,0,0,8,128,0,0,224,127,0,0,104,127,0,0,104,34,1,0,232,10,1,0,168,126,0,0,160,126,0,0,152,126,0,0,136,126,0,0,128,126,0,0,120,126,0,0,16,126,0,0,144,125,0,0,24,125,0,0,224,124,0,0,208,124,0,0,200,124,0,0,184,124,0,0,176,124,0,0,168,124,0,0,160,124,0,0,64,124,0,0,56,124,0,0,240,123,0,0,192,123,0,0,56,105,0,0,208,188,0,0,112,103,0,0,176,188,0,0,88,188,0,0,144,187,0,0,248,101,0,0,200,186,0,0,184,186,0,0,168,186,0,0,192,100,0,0,96,99,0,0,168,123,0,0,184,185,0,0,168,90,0,0,24,88,0,0,16,86,0,0,24,184,0,0,248,183,0,0,224,183,0,0,208,183,0,0,184,82,0,0,96,79,0,0,152,183,0,0,88,78,0,0,176,182,0,0,32,182,0,0,208,181,0,0,184,181,0,0,128,181,0,0,160,123,0,0,240,73,0,0,224,72,0,0,240,18,1,0,120,180,0,0,192,179,0,0,88,179,0,0,8,179,0,0,240,178,0,0,216,178,0,0,200,178,0,0,184,178,0,0,160,178,0,0,136,178,0,0,72,178,0,0,136,177,0,0,168,115,0,0,144,123,0,0,128,123,0,0,112,123,0,0,88,123,0,0,72,123,0,0,0,123,0,0,208,122,0,0,88,122,0,0,72,122,0,0,56,122,0,0,40,122,0,0,24,122,0,0,8,122,0,0,240,121,0,0,216,121,0,0,88,121,0,0,8,121,0,0,128,120,0,0,96,120,0,0,80,120,0,0,64,120,0,0,48,120,0,0,32,120,0,0,16,120,0,0,216,119,0,0,128,119,0,0,40,119,0,0,224,118,0,0,200,118,0,0,184,118,0,0,168,118,0,0,152,118,0,0,136,118,0,0,120,118,0,0,64,118,0,0,200,117,0,0,144,17,1,0,56,17,1,0,216,164,0,0,104,164,0,0,56,117,0,0,248,116,0,0,208,116,0,0,184,116,0,0,160,116,0,0,192,124,0,0,224,163,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,67,97,110,39,116,32,117,115,101,32,97,110,32,117,110,100,101,102,105,110,101,100,32,118,97,108,117,101,32,97,115,32,37,115,32,114,101,102,101,114,101,110,99,101,0,0,0,0,85,110,115,117,112,112,111,114,116,101,100,32,115,111,99,107,101,116,32,102,117,110,99,116,105,111,110,32,34,37,115,34,32,99,97,108,108,101,100,0,73,110,115,101,99,117,114,101,32,100,101,112,101,110,100,101,110,99,121,32,105,110,32,37,115,37,115,0,0,0,0,0,34,37,115,34,32,118,97,114,105,97,98,108,101,32,37,115,32,99,97,110,39,116,32,98,101,32,105,110,32,97,32,112,97,99,107,97,103,101,0,0,77,111,100,105,102,105,99,97,116,105,111,110,32,111,102,32,97,32,114,101,97,100,45,111,110,108,121,32,118,97,108,117,101,32,97,116,116,101,109,112,116,101,100,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,33,10,0,67,97,110,39,116,32,108,111,99,97,108,105,122,101,32,116,104,114,111,117,103,104,32,97,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,77,111,100,105,102,105,99,97,116,105,111,110,32,111,102,32,110,111,110,45,99,114,101,97,116,97,98,108,101,32,104,97,115,104,32,118,97,108,117,101,32,97,116,116,101,109,112,116,101,100,44,32,115,117,98,115,99,114,105,112,116,32,34,37,45,112,34,0,0,0,0,0,84,104,101,32,37,115,32,102,117,110,99,116,105,111,110,32,105,115,32,117,110,105,109,112,108,101,109,101,110,116,101,100,0,0,0,0,0,0,0,0,85,110,115,117,112,112,111,114,116,101,100,32,100,105,114,101,99,116,111,114,121,32,102,117,110,99,116,105,111,110,32,34,37,115,34,32,99,97,108,108,101,100,0,0,0,0,0,0,77,111,100,105,102,105,99,97,116,105,111,110,32,111,102,32,110,111,110,45,99,114,101,97,116,97,98,108,101,32,97,114,114,97,121,32,118,97,108,117,101,32,97,116,116,101,109,112,116,101,100,44,32,115,117,98,115,99,114,105,112,116,32,37,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,255,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,255,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,247,216,217,218,219,220,221,222,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,97,110,105,99,58,32,109,101,109,111,114,121,32,119,114,97,112,0,0,0,0,0,0,2,0,0,0,0,0,0,0,118,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,196,0,0,0,0,0,0,0,0,0,0,0,196,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,196,0,0,0,0,0,0,0,0,0,0,0,196,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,166,0,0,0,154,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,148,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,178,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,1,0,0,254,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,3,0,0,0,0,0,0,182,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,1,0,0,0,0,0,0,252,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,2,0,0,0,0,0,0,32,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,3,0,0,26,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,162,0,0,0,242,0,0,0,0,0,0,0,208,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,3,0,0,218,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,172,2,0,0,150,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,4,0,0,94,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,170,3,0,0,218,3,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,134,0,0,0,82,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,236,3,0,0,110,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,4,0,0,204,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,190,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,130,0,159,0,0,0,0,0,0,0,0,147,0,0,0,0,0,0,0,0,0,0,0,159,0,196,0,0,0,159,0,214,0,20,8,0,214,10,12,0,0,31,0,0,0,145,0,0,31,0,28,158,0,0,0,0,0,0,159,0,0,0,1,0,16,21,9,212,206,11,13,0,143,6,0,0,133,18,18,150,23,154,0,157,155,152,135,0,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,215,248,249,250,251,252,253,254,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,252,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,1,2,84,151,154,155,156,157,165,246,250,3,158,7,18,29,40,51,62,73,85,96,107,118,129,140,147,148,149,150,152,153,255,182,224,205,174,176,180,217,233,232,236,187,235,228,234,226,222,219,211,195,188,193,185,184,191,183,201,229,181,220,194,162,163,208,186,202,200,218,198,179,178,214,166,170,207,199,209,206,204,160,212,216,215,192,175,173,243,172,161,190,203,189,164,230,167,248,227,244,242,255,241,231,240,253,169,210,245,237,249,247,239,168,252,251,254,238,223,221,213,225,177,197,171,196,159,4,5,6,8,9,10,11,12,13,14,15,16,17,19,20,21,22,23,24,25,26,27,28,30,31,32,33,34,35,36,37,38,39,41,42,43,44,45,46,47,48,49,50,52,53,54,55,56,57,58,59,60,61,63,64,65,66,67,68,69,70,71,72,74,75,76,77,78,79,80,81,82,83,86,87,88,89,90,91,92,93,94,95,97,98,99,100,101,102,103,104,105,106,108,109,110,111,112,113,114,115,116,117,119,120,121,122,123,124,125,126,127,128,130,131,132,133,134,135,136,137,138,139,141,142,143,144,145,146,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,215,248,249,250,251,252,253,254,223,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,247,216,217,218,219,220,221,222,255,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,220,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,68,4,0,0,84,0,0,0,76,0,0,0,164,1,0,0,14,3,0,0,206,0,0,0,68,3,0,0,76,2,0,0,214,1,0,0,186,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,106,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,1,0,0,112,1,0,0,210,3,0,0,112,1,0,0,112,1,0,0,104,2,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,168,0,0,0,168,0,0,0,112,1,0,0,168,0,0,0,108,3,0,0,112,1,0,0,226,2,0,0,112,1,0,0,210,3,0,0,210,3,0,0,72,3,0,0,28,2,0,0,204,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,112,1,0,0,180,0,0,0,180,0,0,0,180,0,0,0,112,1,0,0,180,0,0,0,180,0,0,0,238,3,0,0,112,1,0,0,226,2,0,0,112,1,0,0,226,2,0,0,112,1,0,0,54,4,0,0,190,3,0,0,210,3,0,0,190,3,0,0,190,3,0,0,190,3,0,0,190,3,0,0,190,3,0,0,190,3,0,0,190,3,0,0,190,3,0,0,190,3,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,226,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,10,1,0,0,210,3,0,0,92,0,0,0,92,0,0,0,152,1,0,0,152,1,0,0,152,1,0,0,152,1,0,0,152,1,0,0,152,1,0,0,152,1,0,0,152,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,92,0,0,0,92,0,0,0,92,0,0,0,112,1,0,0,112,1,0,0,112,1,0,0,92,0,0,0,240,2,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,248,3,0,0,194,2,0,0,210,3,0,0,6,1,0,0,6,1,0,0,190,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,168,0,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,24,2,0,0,24,2,0,0,24,2,0,0,24,2,0,0,24,2,0,0,24,2,0,0,58,4,0,0,250,2,0,0,168,0,0,0,112,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,210,3,0,0,212,1,0,0,90,2,0,0,112,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,184,3,0,0,184,3,0,0,210,3,0,0,6,0,0,0,210,3,0,0,108,2,0,0,112,1,0,0,108,2,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,42,1,0,0,228,1,0,0,112,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,128,3,0,0,210,3,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,118,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,168,2,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,72,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,98,1,0,0,98,1,0,0,52,4,0,0,210,3,0,0,210,3,0,0,112,1,0,0,38,2,0,0,38,2,0,0,38,2,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,52,4,0,0,38,3,0,0,38,3,0,0,42,2,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,240,3,0,0,140,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,112,1,0,0,112,1,0,0,210,3,0,0,92,2,0,0,92,2,0,0,210,3,0,0,112,1,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,112,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,66,4,0,0,210,3,0,0,104,2,0,0,108,1,0,0,112,1,0,0,108,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,112,1,0,0,210,3,0,0,210,3,0,0,112,1,0,0,210,3,0,0,210,3,0,0,112,1,0,0,210,3,0,0,210,3,0,0,112,1,0,0,210,3,0,0,210,3,0,0,210,3,0,0,210,3,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,112,1,0,0,112,1,0,0,112,1,0,0,210,3,0,0,210,3,0,0,112,1,0,0,112,1,0,0,112,1,0,0,112,1,0,0,210,3,0,0,210,1,0,0,112,1,0,0,112,1,0,0,24,2,0,0,24,2,0,0,24,2,0,0,112,1,0,0,112,1,0,0,210,3,0,0,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,176,1,152,129,128,1,152,129,128,1,24,128,128,1,152,129,128,1,152,129,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,128,1,0,128,112,0,158,129,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,64,12,102,128,64,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,64,12,102,128,0,12,102,128,0,12,102,128,67,14,7,56,67,14,7,56,67,14,7,56,67,14,7,56,67,14,7,56,67,14,7,56,67,14,7,56,67,14,7,56,67,14,6,56,67,14,6,56,64,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,79,60,6,126,79,60,6,62,79,60,6,62,79,60,6,62,79,60,6,62,79,60,6,126,79,60,6,30,79,60,6,94,79,60,6,94,79,60,6,94,79,60,6,94,79,60,6,94,79,60,6,30,79,60,6,94,79,60,6,30,79,60,6,30,79,60,6,30,79,60,6,30,79,60,6,94,79,60,6,94,79,60,6,30,79,60,6,30,79,60,6,94,79,60,6,30,79,60,6,94,79,60,6,30,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,64,60,102,24,0,12,102,128,79,252,6,120,79,252,6,56,79,252,6,56,79,252,6,56,79,252,6,56,79,252,6,120,79,252,6,24,79,252,6,88,79,252,6,88,79,252,6,88,79,252,6,88,79,252,6,88,79,252,6,24,79,252,6,88,79,252,6,24,79,252,6,24,79,252,6,24,79,252,6,24,79,252,6,88,79,252,6,88,79,252,6,24,79,252,6,24,79,252,6,88,79,252,6,24,79,252,6,88,79,252,6,24,0,12,102,128,0,12,102,128,0,12,102,128,0,12,102,128,128,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,16,129,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,0,1,0,128,96,0,20,129,0,8,68,128,0,8,4,128,0,8,4,128,0,8,4,128,0,8,4,128,0,8,4,128,0,8,68,128,0,8,4,0,0,8,4,128,74,168,4,16,0,8,68,128,0,8,4,128,0,8,4,128,0,8,4,128,0,8,4,0,0,8,4,128,0,8,4,128,0,8,4,0,0,8,4,0,0,8,4,0,74,168,4,80,0,8,68,128,0,8,68,0,0,8,4,0,0,8,4,0,74,168,4,16,0,8,68,128,0,8,4,0,0,8,4,0,0,8,4,0,0,8,68,128,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,84,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,0,8,4,128,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,40,4,20,74,168,4,80,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,80,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,0,8,4,128,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,16,74,168,4,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4,1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,4,5,5,6,5,6,6,7,5,6,6,7,6,7,7,8,32,80,69,82,76,95,77,73,67,82,79,32,80,69,82,76,95,85,83,69,83,95,80,76,95,80,73,68,83,84,65,84,85,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,186,0,0,88,74,0,0,72,73,0,0,0,72,0,0,88,70,0,0,72,69,0,0,104,68,0,0,240,67,0,0,104,67,0,0,224,66,0,0,104,66,0,0,200,65,0,0,240,29,1,0,128,29,1,0,112,27,1,0,160,26,1,0,0,26,1,0,104,25,1,0,112,24,1,0,184,23,1,0,48,23,1,0,216,22,1,0,120,22,1,0,24,22,1,0,80,21,1,0,32,20,1,0,104,19,1,0,88,18,1,0,216,17,1,0,72,17,1,0,224,16,1,0,88,16,1,0,232,15,1,0,216,14,1,0,48,14,1,0,96,13,1,0,112,12,1,0,248,10,1,0,112,10,1,0,232,9,1,0,144,9,1,0,40,9,1,0,136,8,1,0,176,7,1,0,152,6,1,0,96,5,1,0,88,4,1,0,64,3,1,0,232,2,1,0,176,2,1,0,64,2,1,0,240,1,1,0,168,1,1,0,72,1,1,0,120,0,1,0,128,255,0,0,248,254,0,0,16,254,0,0,184,253,0,0,96,253,0,0,24,253,0,0,216,252,0,0,112,252,0,0,200,251,0,0,232,250,0,0,88,250,0,0,176,249,0,0,0,249,0,0,8,68,0,0,0,0,0,0,2,4,4,4,4,4,3,3,5,3,3,2,2,4,4,3,4,2,3,2,3,3,3,3,3,3,3,3,3,9,2,3,2,3,2,3,2,3,2,3,3,4,3,4,3,4,2,3,2,3,2,3,4,4,2,6,4,4,4,4,5,2,3,2,3,3,3,3,7,0,0,0,2,0,0,0,0,0,0,0,186,114,112,63,0,0,0,0,0,1,0,0,0,0,0,0,20,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,91,0,0,0,95,0,0,0,96,0,0,0,97,0,0,0,123,0,0,0,170,0,0,0,171,0,0,0,181,0,0,0,182,0,0,0,186,0,0,0,187,0,0,0,192,0,0,0,215,0,0,0,216,0,0,0,247,0,0,0,248,0,0,0,194,2,0,0,6,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,65,0,0,0,91,0,0,0,192,0,0,0,215,0,0,0,216,0,0,0,223,0,0,0,20,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,33,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,91,0,0,0,97,0,0,0,123,0,0,0,127,0,0,0,161,0,0,0,162,0,0,0,167,0,0,0,168,0,0,0,171,0,0,0,172,0,0,0,182,0,0,0,184,0,0,0,187,0,0,0,188,0,0,0,191,0,0,0,192,0,0,0,4,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,32,0,0,0,127,0,0,0,160,0,0,0,120,3,0,0,12,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,97,0,0,0,123,0,0,0,170,0,0,0,171,0,0,0,181,0,0,0,182,0,0,0,186,0,0,0,187,0,0,0,223,0,0,0,247,0,0,0,248,0,0,0,0,1,0,0,4,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,33,0,0,0,127,0,0,0,161,0,0,0,120,3,0,0,16,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,65,0,0,0,91,0,0,0,97,0,0,0,123,0,0,0,170,0,0,0,171,0,0,0,181,0,0,0,182,0,0,0,186,0,0,0,187,0,0,0,192,0,0,0,215,0,0,0,216,0,0,0,247,0,0,0,248,0,0,0,194,2,0,0,18,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,48,0,0,0,58,0,0,0,65,0,0,0,91,0,0,0,97,0,0,0,123,0,0,0,170,0,0,0,171,0,0,0,181,0,0,0,182,0,0,0,186,0,0,0,187,0,0,0,192,0,0,0,215,0,0,0,216,0,0,0,247,0,0,0,248,0,0,0,194,2,0,0,16,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,65,0,0,0,91,0,0,0,97,0,0,0,123,0,0,0,170,0,0,0,171,0,0,0,181,0,0,0,182,0,0,0,186,0,0,0,187,0,0,0,192,0,0,0,215,0,0,0,216,0,0,0,247,0,0,0,248,0,0,0,187,1,0,0,1,0,0,0,0,0,0,0,186,114,112,63,1,0,0,0,0,1,0,0,0,0,0,0,2,0,0,0,0,0,0,0,186,114,112,63,0,0,0,0,128,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOPNOTSUPP:45,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_NORMAL);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function(chunkSize, length) {
            this.length = length;
            this.chunkSize = chunkSize;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % chunkSize;
            var chunkNum = Math.floor(idx / chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
          if (!hasByteServing) chunkSize = datalength;
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = new LazyUint8Array(chunkSize, datalength);
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * lazyArray.chunkSize;
            var end = (chunkNum+1) * lazyArray.chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.findObject('/dev') || FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_STATIC) ], 'void*', ALLOC_STATIC, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = flagAlternative ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      // We use file descriptor numbers and FILE* streams interchangeably.
      return stream;
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  function ___errno_location() {
      if (!___setErrNo.ret) {
        ___setErrNo.ret = allocate([0], 'i32', ALLOC_NORMAL);
        HEAP32[((___setErrNo.ret)>>2)]=0
      }
      return ___setErrNo.ret;
    }var ___errno=___errno_location;
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm.setTempRet0(Math.min(Math.floor((ret)/(+(4294967296))), (+(4294967295)))>>>0),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      var flush = function(filedes) {
        // Right now we write all data directly, except for output devices.
        if (FS.streams[filedes] && FS.streams[filedes].object.output) {
          if (!FS.streams[filedes].isTerminal) { // don't flush terminals, it would cause a \n to also appear
            FS.streams[filedes].object.output(null);
          }
        }
      };
      try {
        if (stream === 0) {
          for (var i = 0; i < FS.streams.length; i++) if (FS.streams[i]) flush(i);
        } else {
          flush(stream);
        }
        return 0;
      } catch (e) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
  var ___flock_struct_layout={__size__:16,l_type:0,l_whence:2,l_start:4,l_len:8,l_pid:12,l_xxx:14};function _fcntl(fildes, cmd, varargs, dup2) {
      // int fcntl(int fildes, int cmd, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/fcntl.html
      if (!FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      var stream = FS.streams[fildes];
      switch (cmd) {
        case 0:
          var arg = HEAP32[((varargs)>>2)];
          if (arg < 0) {
            ___setErrNo(ERRNO_CODES.EINVAL);
            return -1;
          }
          var newStream = {};
          for (var member in stream) {
            newStream[member] = stream[member];
          }
          arg = dup2 ? arg : Math.max(arg, FS.streams.length); // dup2 wants exactly arg; fcntl wants a free descriptor >= arg
          for (var i = FS.streams.length; i < arg; i++) {
            FS.streams[i] = null; // Keep dense
          }
          FS.streams[arg] = newStream;
          return arg;
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          var flags = 0;
          if (stream.isRead && stream.isWrite) flags = 2;
          else if (!stream.isRead && stream.isWrite) flags = 1;
          else if (stream.isRead && !stream.isWrite) flags = 0;
          if (stream.isAppend) flags |= 8;
          // Synchronization and blocking flags are irrelevant to us.
          return flags;
        case 4:
          var arg = HEAP32[((varargs)>>2)];
          stream.isAppend = Boolean(arg | 8);
          // Synchronization and blocking flags are irrelevant to us.
          return 0;
        case 7:
        case 20:
          var arg = HEAP32[((varargs)>>2)];
          var offset = ___flock_struct_layout.l_type;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)]=3
          return 0;
        case 8:
        case 9:
        case 21:
        case 22:
          // Pretend that the locking is successful.
          return 0;
        case 6:
        case 5:
          // These are for sockets. We don't have them fully implemented yet.
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        default:
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
      }
      // Should never be reached. Only to silence strict warnings.
      return -1;
    }function _dup(fildes) {
      // int dup(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/dup.html
      return _fcntl(fildes, 0, allocate([0, 0, 0, 0], 'i32', ALLOC_STACK));  // F_DUPFD.
    }
  var ___stat_struct_layout={__size__:68,st_dev:0,st_ino:4,st_mode:8,st_nlink:12,st_uid:16,st_gid:20,st_rdev:24,st_size:28,st_atime:32,st_spare1:36,st_mtime:40,st_spare2:44,st_ctime:48,st_spare3:52,st_blksize:56,st_blocks:60,st_spare4:64};function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      var obj = FS.findObject(Pointer_stringify(path), dontResolveLastLink);
      if (obj === null || !FS.forceLoadFile(obj)) return -1;
      var offsets = ___stat_struct_layout;
      // Constants.
      HEAP32[(((buf)+(offsets.st_nlink))>>2)]=1
      HEAP32[(((buf)+(offsets.st_uid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_gid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_blksize))>>2)]=4096
      // Variables.
      HEAP32[(((buf)+(offsets.st_ino))>>2)]=obj.inodeNumber
      var time = Math.floor(obj.timestamp / 1000);
      if (offsets.st_atime === undefined) {
        offsets.st_atime = offsets.st_atim.tv_sec;
        offsets.st_mtime = offsets.st_mtim.tv_sec;
        offsets.st_ctime = offsets.st_ctim.tv_sec;
        var nanosec = (obj.timestamp % 1000) * 1000;
        HEAP32[(((buf)+(offsets.st_atim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_mtim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_ctim.tv_nsec))>>2)]=nanosec
      }
      HEAP32[(((buf)+(offsets.st_atime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_mtime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_ctime))>>2)]=time
      var mode = 0;
      var size = 0;
      var blocks = 0;
      var dev = 0;
      var rdev = 0;
      if (obj.isDevice) {
        //  Device numbers reuse inode numbers.
        dev = rdev = obj.inodeNumber;
        size = blocks = 0;
        mode = 0x2000;  // S_IFCHR.
      } else {
        dev = 1;
        rdev = 0;
        // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
        //       but this is not required by the standard.
        if (obj.isFolder) {
          size = 4096;
          blocks = 1;
          mode = 0x4000;  // S_IFDIR.
        } else {
          var data = obj.contents || obj.link;
          size = data.length;
          blocks = Math.ceil(data.length / 4096);
          mode = obj.link === undefined ? 0x8000 : 0xA000;  // S_IFREG, S_IFLNK.
        }
      }
      HEAP32[(((buf)+(offsets.st_dev))>>2)]=dev;
      HEAP32[(((buf)+(offsets.st_rdev))>>2)]=rdev;
      HEAP32[(((buf)+(offsets.st_size))>>2)]=size
      HEAP32[(((buf)+(offsets.st_blocks))>>2)]=blocks
      if (obj.read) mode |= 0x16D;  // S_IRUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH.
      if (obj.write) mode |= 0x92;  // S_IWUSR | S_IWGRP | S_IWOTH.
      HEAP32[(((buf)+(offsets.st_mode))>>2)]=mode
      return 0;
    }function _fstat(fildes, buf) {
      // int fstat(int fildes, struct stat *buf);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/fstat.html
      if (!FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else {
        var pathArray = intArrayFromString(FS.streams[fildes].path);
        return _stat(allocate(pathArray, 'i8', ALLOC_STACK), buf);
      }
    }
  function _clearerr(stream) {
      // void clearerr(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/clearerr.html
      if (FS.streams[stream]) FS.streams[stream].error = false;
    }
  function _chmod(path, mode) {
      // int chmod(const char *path, mode_t mode);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/chmod.html
      var obj = FS.findObject(Pointer_stringify(path));
      if (obj === null) return -1;
      obj.read = mode & 0x100;  // S_IRUSR.
      obj.write = mode & 0x80;  // S_IWUSR.
      obj.timestamp = Date.now();
      return 0;
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _rename(old, new_) {
      // int rename(const char *old, const char *new);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rename.html
      var oldObj = FS.analyzePath(Pointer_stringify(old));
      var newObj = FS.analyzePath(Pointer_stringify(new_));
      if (newObj.path == oldObj.path) {
        return 0;
      } else if (!oldObj.exists) {
        ___setErrNo(oldObj.error);
        return -1;
      } else if (oldObj.isRoot || oldObj.path == FS.currentPath) {
        ___setErrNo(ERRNO_CODES.EBUSY);
        return -1;
      } else if (newObj.path && newObj.path.indexOf(oldObj.path) == 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else if (newObj.exists && newObj.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else {
        delete oldObj.parentObject.contents[oldObj.name];
        newObj.parentObject.contents[newObj.name] = oldObj.object;
        return 0;
      }
    }
  var ERRNO_MESSAGES={1:"Operation not permitted",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"Input/output error",6:"No such device or address",8:"Exec format error",9:"Bad file descriptor",10:"No child processes",11:"Resource temporarily unavailable",12:"Cannot allocate memory",13:"Permission denied",14:"Bad address",16:"Device or resource busy",17:"File exists",18:"Invalid cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Inappropriate ioctl for device",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read-only file system",31:"Too many links",32:"Broken pipe",33:"Numerical argument out of domain",34:"Numerical result out of range",35:"Resource deadlock avoided",36:"File name too long",37:"No locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many levels of symbolic links",42:"No message of desired type",43:"Identifier removed",45:"Op not supported on transport endpoint",60:"Device not a stream",61:"No data available",62:"Timer expired",63:"Out of streams resources",67:"Link has been severed",71:"Protocol error",72:"Multihop attempted",74:"Bad message",75:"Value too large for defined data type",84:"Invalid or incomplete multibyte or wide character",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Protocol not supported",95:"Operation not supported",97:"Address family not supported by protocol",98:"Address already in use",99:"Cannot assign requested address",100:"Network is down",101:"Network is unreachable",102:"Network dropped connection on reset",103:"Software caused connection abort",104:"Connection reset by peer",105:"No buffer space available",106:"Transport endpoint is already connected",107:"Transport endpoint is not connected",110:"Connection timed out",111:"Connection refused",113:"No route to host",114:"Operation already in progress",115:"Operation now in progress",116:"Stale NFS file handle",122:"Disk quota exceeded",125:"Operation canceled",130:"Owner died",131:"State not recoverable"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _unlink(path) {
      // int unlink(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/unlink.html
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists || !path.exists) {
        ___setErrNo(path.error);
        return -1;
      } else if (path.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (!path.object.write) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else {
        delete path.parentObject.contents[path.name];
        return 0;
      }
    }
  function _ferror(stream) {
      // int ferror(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ferror.html
      return Number(FS.streams[stream] && FS.streams[stream].error);
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _read(stream, _fgetc.ret, 1);
      if (ret == 0) {
        streamObj.eof = true;
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      if (FS.streams[stream]) {
        c = unSign(c & 0xFF);
        FS.streams[stream].ungotten.push(c);
        return c;
      } else {
        return -1;
      }
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }
  function _execl(/* ... */) {
      // int execl(const char *path, const char *arg0, ... /*, (char *)0 */);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/exec.html
      // We don't support executing external code.
      ___setErrNo(ERRNO_CODES.ENOEXEC);
      return -1;
    }var _execvp=_execl;
  function _getgid() {
      // gid_t getgid(void);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/getgid.html
      // We have just one process/group/user, all with ID 0.
      return 0;
    }var _geteuid=_getgid;
  var _getuid=_getgid;
  var _getegid=_getgid;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var _getpid=_getgid;
  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
    }
  function _setgid(gid) {
      // int setgid(gid_t gid);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/setgid.html
      // We have just one process/group/user, so it makes no sense to set IDs.
      ___setErrNo(ERRNO_CODES.EPERM);
      return -1;
    }var _setuid=_setgid;
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }
  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _strrchr(ptr, chr) {
      var ptr2 = ptr + _strlen(ptr);
      do {
        if (HEAP8[(ptr2)] == chr) return ptr2;
        ptr2--;
      } while (ptr2 >= ptr);
      return 0;
    }
  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var comparator = function(x, y) {
        return Runtime.dynCall('iii', cmp, [x, y]);
      }
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return comparator(base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    }
  Module["_saveSetjmp"] = _saveSetjmp;
  Module["_testSetjmp"] = _testSetjmp;var _setjmp=undefined;
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _kill(pid, sig) {
      // int kill(pid_t pid, int sig);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/kill.html
      // Makes no sense in a single-process environment.
      ___setErrNo(ERRNO_CODES.EPERM);
      return -1;
    }
  function _longjmp(env, value) {
      asm.setThrew(env, value || 1);
      throw 'longjmp';
    }
  function _chdir(path) {
      // int chdir(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/chdir.html
      // NOTE: The path argument may be a string, to simplify fchdir().
      if (typeof path !== 'string') path = Pointer_stringify(path);
      path = FS.analyzePath(path);
      if (!path.exists) {
        ___setErrNo(path.error);
        return -1;
      } else if (!path.object.isFolder) {
        ___setErrNo(ERRNO_CODES.ENOTDIR);
        return -1;
      } else {
        FS.currentPath = path.path;
        return 0;
      }
    }
  function _fdopen(fildes, mode) {
      // FILE *fdopen(int fildes, const char *mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fdopen.html
      if (FS.streams[fildes]) {
        var stream = FS.streams[fildes];
        mode = Pointer_stringify(mode);
        if ((mode.indexOf('w') != -1 && !stream.isWrite) ||
            (mode.indexOf('r') != -1 && !stream.isRead) ||
            (mode.indexOf('a') != -1 && !stream.isAppend) ||
            (mode.indexOf('+') != -1 && (!stream.isRead || !stream.isWrite))) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return 0;
        } else {
          stream.error = false;
          stream.eof = false;
          return fildes;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isCreate || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id = FS.streams.length; // Keep dense
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        FS.streams[id] = {
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        };
      } else {
        FS.streams[id] = {
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        };
      }
      return id;
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _tmpnam(s, dir, prefix) {
      // char *tmpnam(char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpnam.html
      // NOTE: The dir and prefix arguments are for internal use only.
      var folder = FS.findObject(dir || '/tmp');
      if (!folder || !folder.isFolder) {
        dir = '/tmp';
        folder = FS.findObject(dir);
        if (!folder || !folder.isFolder) return 0;
      }
      var name = prefix || 'file';
      do {
        name += String.fromCharCode(65 + Math.floor(Math.random() * 25));
      } while (name in folder.contents);
      var result = dir + '/' + name;
      if (!_tmpnam.buffer) _tmpnam.buffer = _malloc(256);
      if (!s) s = _tmpnam.buffer;
      for (var i = 0; i < result.length; i++) {
        HEAP8[(((s)+(i))|0)]=result.charCodeAt(i);
      }
      HEAP8[(((s)+(i))|0)]=0;
      return s;
    }function _tmpfile() {
      // FILE *tmpfile(void);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpfile.html
      // TODO: Delete the created file on closing.
      if (_tmpfile.mode) {
        _tmpfile.mode = allocate(intArrayFromString('w+'), 'i8', ALLOC_NORMAL);
      }
      return _fopen(_tmpnam(0), _tmpfile.mode);
    }
  function _freopen(filename, mode, stream) {
      // FILE *freopen(const char *restrict filename, const char *restrict mode, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/freopen.html
      if (!filename) {
        if (!FS.streams[stream]) {
          ___setErrNo(ERRNO_CODES.EBADF);
          return 0;
        }
        if (_freopen.buffer) _free(_freopen.buffer);
        filename = intArrayFromString(FS.streams[stream].path);
        filename = allocate(filename, 'i8', ALLOC_NORMAL);
      }
      _fclose(stream);
      return _fopen(filename, mode);
    }
  var _llvm_pow_f64=Math.pow;
  var _floor=Math.floor;
  function _fmod(x, y) {
      return x % y;
    }
  var _atan2=Math.atan2;
  var _sin=Math.sin;
  var _cos=Math.cos;
  var _exp=Math.exp;
  var _log=Math.log;
  var _sqrt=Math.sqrt;
  function _srand(seed) {}
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  var _ceil=Math.ceil;
  Module["_tolower"] = _tolower;
  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }
  function _strstr(ptr1, ptr2) {
      var check = 0, start;
      do {
        if (!check) {
          start = ptr1;
          check = ptr2;
        }
        var curr1 = HEAP8[((ptr1++)|0)];
        var curr2 = HEAP8[((check++)|0)];
        if (curr2 == 0) return start;
        if (curr2 != curr1) {
          // rewind to one character after start, to find ez in eeez
          ptr1 = start + 1;
          check = 0;
        }
      } while (curr1);
      return 0;
    }
  function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) return 0;
      var bytesRead = _read(stream, ptr, bytesToRead);
      var streamObj = FS.streams[stream];
      if (bytesRead == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        if (bytesRead < bytesToRead) streamObj.eof = true;
        return Math.floor(bytesRead / size);
      }
    }
  function _isatty(fildes) {
      // int isatty(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/isatty.html
      if (!FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      if (FS.streams[fildes].isTerminal) return 1;
      ___setErrNo(ERRNO_CODES.ENOTTY);
      return 0;
    }
  function _umask(newMask) {
      // mode_t umask(mode_t cmask);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/umask.html
      // NOTE: This value isn't actually used for anything.
      if (_umask.cmask === undefined) _umask.cmask = 0x1FF;  // S_IRWXU | S_IRWXG | S_IRWXO.
      var oldMask = _umask.cmask;
      _umask.cmask = newMask;
      return oldMask;
    }
  function _closedir(dirp) {
      // int closedir(DIR *dirp);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/closedir.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        return ___setErrNo(ERRNO_CODES.EBADF);
      } else {
        _free(FS.streams[dirp].currentEntry);
        FS.streams[dirp] = null;
        return 0;
      }
    }
  function _opendir(dirname) {
      // DIR *opendir(const char *dirname);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/opendir.html
      // NOTE: Calculating absolute path redundantly since we need to associate it
      //       with the opened stream.
      var path = FS.absolutePath(Pointer_stringify(dirname));
      if (path === null) {
        ___setErrNo(ERRNO_CODES.ENOENT);
        return 0;
      }
      var target = FS.findObject(path);
      if (target === null) return 0;
      if (!target.isFolder) {
        ___setErrNo(ERRNO_CODES.ENOTDIR);
        return 0;
      } else if (!target.read) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return 0;
      }
      var id = FS.streams.length; // Keep dense
      var contents = [];
      for (var key in target.contents) contents.push(key);
      FS.streams[id] = {
        path: path,
        object: target,
        // An index into contents. Special values: -2 is ".", -1 is "..".
        position: -2,
        isRead: true,
        isWrite: false,
        isAppend: false,
        error: false,
        eof: false,
        ungotten: [],
        // Folder-specific properties:
        // Remember the contents at the time of opening in an array, so we can
        // seek between them relying on a single order.
        contents: contents,
        // Each stream has its own area for readdir() returns.
        currentEntry: _malloc(___dirent_struct_layout.__size__)
      };
      return id;
    }
  function _readdir_r(dirp, entry, result) {
      // int readdir_r(DIR *dirp, struct dirent *entry, struct dirent **result);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/readdir_r.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        return ___setErrNo(ERRNO_CODES.EBADF);
      }
      var stream = FS.streams[dirp];
      var loc = stream.position;
      var entries = 0;
      for (var key in stream.contents) entries++;
      if (loc < -2 || loc >= entries) {
        HEAP32[((result)>>2)]=0
      } else {
        var name, inode, type;
        if (loc === -2) {
          name = '.';
          inode = 1;  // Really undefined.
          type = 4; //DT_DIR
        } else if (loc === -1) {
          name = '..';
          inode = 1;  // Really undefined.
          type = 4; //DT_DIR
        } else {
          var object;
          name = stream.contents[loc];
          object = stream.object.contents[name];
          inode = object.inodeNumber;
          type = object.isDevice ? 2 // DT_CHR, character device.
                : object.isFolder ? 4 // DT_DIR, directory.
                : object.link !== undefined ? 10 // DT_LNK, symbolic link.
                : 8; // DT_REG, regular file.
        }
        stream.position++;
        var offsets = ___dirent_struct_layout;
        HEAP32[(((entry)+(offsets.d_ino))>>2)]=inode
        HEAP32[(((entry)+(offsets.d_off))>>2)]=stream.position
        HEAP32[(((entry)+(offsets.d_reclen))>>2)]=name.length + 1
        for (var i = 0; i < name.length; i++) {
          HEAP8[(((entry + offsets.d_name)+(i))|0)]=name.charCodeAt(i)
        }
        HEAP8[(((entry + offsets.d_name)+(i))|0)]=0
        HEAP8[(((entry)+(offsets.d_type))|0)]=type
        HEAP32[((result)>>2)]=entry
      }
      return 0;
    }function _readdir(dirp) {
      // struct dirent *readdir(DIR *dirp);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/readdir_r.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      } else {
        if (!_readdir.result) _readdir.result = _malloc(4);
        _readdir_r(dirp, FS.streams[dirp].currentEntry, _readdir.result);
        if (HEAP32[((_readdir.result)>>2)] === 0) {
          return 0;
        } else {
          return FS.streams[dirp].currentEntry;
        }
      }
    }
  function _pipe(fildes) {
      // int pipe(int fildes[2]);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/pipe.html
      // It is possible to implement this using two device streams, but pipes make
      // little sense in a single-threaded environment, so we do not support them.
      ___setErrNo(ERRNO_CODES.ENOSYS);
      return -1;
    }
  function _usleep(useconds) {
      // int usleep(useconds_t useconds);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/usleep.html
      // We're single-threaded, so use a busy loop. Super-ugly.
      var msec = useconds / 1000;
      var start = Date.now();
      while (Date.now() - start < msec) {
        // Do nothing.
      }
      return 0;
    }function _sleep(seconds) {
      // unsigned sleep(unsigned seconds);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/sleep.html
      return _usleep(seconds * 1e6);
    }
  var ___tm_struct_layout={__size__:44,tm_sec:0,tm_min:4,tm_hour:8,tm_mday:12,tm_mon:16,tm_year:20,tm_wday:24,tm_yday:28,tm_isdst:32,tm_gmtoff:36,tm_zone:40};
  var ___tm_current=allocate(4*26, "i8", ALLOC_STATIC);
  var ___tm_timezones={};
  var __tzname=allocate(8, "i32*", ALLOC_STATIC);
  var __daylight=allocate(1, "i32*", ALLOC_STATIC);
  var __timezone=allocate(1, "i32*", ALLOC_STATIC);function _tzset() {
      // TODO: Use (malleable) environment variables instead of system settings.
      if (_tzset.called) return;
      _tzset.called = true;
      HEAP32[((__timezone)>>2)]=-(new Date()).getTimezoneOffset() * 60
      var winter = new Date(2000, 0, 1);
      var summer = new Date(2000, 6, 1);
      HEAP32[((__daylight)>>2)]=Number(winter.getTimezoneOffset() != summer.getTimezoneOffset())
      var winterName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | winter.toString().match(/\(([A-Z]+)\)/)[1];
      var summerName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | summer.toString().match(/\(([A-Z]+)\)/)[1];
      var winterNamePtr = allocate(intArrayFromString(winterName), 'i8', ALLOC_NORMAL);
      var summerNamePtr = allocate(intArrayFromString(summerName), 'i8', ALLOC_NORMAL);
      HEAP32[((__tzname)>>2)]=winterNamePtr
      HEAP32[(((__tzname)+(4))>>2)]=summerNamePtr
    }function _localtime_r(time, tmPtr) {
      _tzset();
      var offsets = ___tm_struct_layout;
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[(((tmPtr)+(offsets.tm_sec))>>2)]=date.getSeconds()
      HEAP32[(((tmPtr)+(offsets.tm_min))>>2)]=date.getMinutes()
      HEAP32[(((tmPtr)+(offsets.tm_hour))>>2)]=date.getHours()
      HEAP32[(((tmPtr)+(offsets.tm_mday))>>2)]=date.getDate()
      HEAP32[(((tmPtr)+(offsets.tm_mon))>>2)]=date.getMonth()
      HEAP32[(((tmPtr)+(offsets.tm_year))>>2)]=date.getFullYear()-1900
      HEAP32[(((tmPtr)+(offsets.tm_wday))>>2)]=date.getDay()
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(offsets.tm_yday))>>2)]=yday
      HEAP32[(((tmPtr)+(offsets.tm_gmtoff))>>2)]=start.getTimezoneOffset() * 60
      var dst = Number(start.getTimezoneOffset() != date.getTimezoneOffset());
      HEAP32[(((tmPtr)+(offsets.tm_isdst))>>2)]=dst
      var timezone = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | date.toString().match(/\(([A-Z]+)\)/)[1];
      if (!(timezone in ___tm_timezones)) {
        ___tm_timezones[timezone] = allocate(intArrayFromString(timezone), 'i8', ALLOC_NORMAL);
      }
      HEAP32[(((tmPtr)+(offsets.tm_zone))>>2)]=___tm_timezones[timezone]
      return tmPtr;
    }function _localtime(time) {
      return _localtime_r(time, ___tm_current);
    }
  function _modf(x, intpart) {
      HEAPF64[((intpart)>>3)]=Math.floor(x)
      return x - HEAPF64[((intpart)>>3)];
    }
  function _strcspn(pstr, pset) {
      var str = pstr, set, strcurr, setcurr;
      while (1) {
        strcurr = HEAP8[(str)];
        if (!strcurr) return str - pstr;
        set = pset;
        while (1) {
          setcurr = HEAP8[(set)];
          if (!setcurr || setcurr == strcurr) break;
          set++;
        }
        if (setcurr) return str - pstr;
        str++;
      }
    }
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _iscntrl(chr) {
      return (0 <= chr && chr <= 0x1F) || chr === 0x7F;
    }
  function _isprint(chr) {
      return 0x1F < chr && chr < 0x7F;
    }var _isgraph=_isprint;
  function _islower(chr) {
      return chr >= 97 && chr <= 122;
    }
  function _ispunct(chr) {
      return (chr >= 33 && chr <= 47) ||
             (chr >= 58 && chr <= 64) ||
             (chr >= 91 && chr <= 96) ||
             (chr >= 123 && chr <= 126);
    }
  function _isupper(chr) {
      return chr >= 65 && chr <= 90;
    }
  function _feof(stream) {
      // int feof(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/feof.html
      return Number(FS.streams[stream] && FS.streams[stream].eof);
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function _frexp(x, exp_addr) {
      var sig = 0, exp_ = 0;
      if (x !== 0) {
        var raw_exp = Math.log(x)/Math.log(2);
        exp_ = Math.ceil(raw_exp);
        if (exp_ === raw_exp) exp_ += 1;
        sig = x/Math.pow(2, exp_);
      }
      HEAP32[((exp_addr)>>2)]=exp_
      return sig;
    }
  var _execv=_execl;
  function _putenv(string) {
      // int putenv(char *string);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/putenv.html
      // WARNING: According to the standard (and the glibc implementation), the
      //          string is taken by reference so future changes are reflected.
      //          We copy it instead, possibly breaking some uses.
      if (string === 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
      string = Pointer_stringify(string);
      var splitPoint = string.indexOf('=')
      if (string === '' || string.indexOf('=') === -1) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
      var name = string.slice(0, splitPoint);
      var value = string.slice(splitPoint + 1);
      if (!(name in ENV) || ENV[name] !== value) {
        ENV[name] = value;
        ___buildEnvironment(ENV);
      }
      return 0;
    }
  function _fork() {
      // pid_t fork(void);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fork.html
      // We don't support multiple processes.
      ___setErrNo(ERRNO_CODES.EAGAIN);
      return -1;
    }
  function _wait(stat_loc) {
      // pid_t wait(int *stat_loc);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/wait.html
      // Makes no sense in a single-process environment.
      ___setErrNo(ERRNO_CODES.ECHILD);
      return -1;
    }
  var ___div_t_struct_layout={__size__:8,quot:0,rem:4};function _div(divt, numer, denom) {
      var quot = Math.floor(numer / denom);
      var rem = numer - quot * denom;
      var offset = ___div_t_struct_layout.rem;
      HEAP32[((divt)>>2)]=quot;
      HEAP32[(((divt)+(offset))>>2)]=rem;
      return divt;
    }
  function _strtoul(str, endptr, base) {
      return __parseInt(str, endptr, base, 0, 4294967295, 32, true);  // ULONG_MAX.
    }
  function _vsprintf(s, format, va_arg) {
      return _sprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _llvm_uadd_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm.setTempRet0(x+y > 4294967295),(x+y)>>>0)|0);
    }
  function _llvm_bswap_i32(x) {
      return ((x&0xff)<<24) | (((x>>8)&0xff)<<16) | (((x>>16)&0xff)<<8) | (x>>>24);
    }
  function _llvm_bswap_i16(x) {
      return ((x&0xff)<<8) | ((x>>8)&0xff);
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var _llvm_memset_p0i8_i64=_memset;
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            setTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'];
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        this.lockPointer = lockPointer;
        this.resizeCanvas = resizeCanvas;
        if (typeof this.lockPointer === 'undefined') this.lockPointer = true;
        if (typeof this.resizeCanvas === 'undefined') this.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!this.fullScreenHandlersInstalled) {
          this.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
___buildEnvironment(ENV);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module.dynCall_iiii(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_i(index) {
  try {
    return Module.dynCall_i(index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module.dynCall_vi(index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    return Module.dynCall_iiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module.dynCall_vii(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module.dynCall_iiiiiii(index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module.dynCall_ii(index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module.dynCall_viii(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_ff(index,a1) {
  try {
    return Module.dynCall_ff(index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_v(index) {
  try {
    Module.dynCall_v(index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module.dynCall_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module.dynCall_iiiii(index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module.dynCall_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module.dynCall_iii(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module.dynCall_iiiiii(index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module.dynCall_viiii(index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stdout|0;var n=env._stdin|0;var o=env._stderr|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ab=env.abort;var ac=env.assert;var ad=env.asmPrintInt;var ae=env.asmPrintFloat;var af=env.copyTempDouble;var ag=env.copyTempFloat;var ah=env.min;var ai=env.invoke_iiii;var aj=env.invoke_i;var ak=env.invoke_vi;var al=env.invoke_iiiiiiiiiii;var am=env.invoke_vii;var an=env.invoke_iiiiiii;var ao=env.invoke_ii;var ap=env.invoke_viii;var aq=env.invoke_ff;var ar=env.invoke_v;var as=env.invoke_iiiiiiiii;var at=env.invoke_iiiii;var au=env.invoke_iiiiiiii;var av=env.invoke_iii;var aw=env.invoke_iiiiii;var ax=env.invoke_viiii;var ay=env._llvm_lifetime_end;var az=env._lseek;var aA=env._rand;var aB=env._fclose;var aC=env._kill;var aD=env._strtoul;var aE=env._fflush;var aF=env._strtol;var aG=env._fputc;var aH=env._fwrite;var aI=env._umask;var aJ=env._setgid;var aK=env._tmpnam;var aL=env._isspace;var aM=env._localtime;var aN=env._read;var aO=env._ceil;var aP=env._execl;var aQ=env._fileno;var aR=env._strstr;var aS=env._fsync;var aT=env._opendir;var aU=env._freopen;var aV=env._sleep;var aW=env._div;var aX=env._strcmp;var aY=env._memchr;var aZ=env._llvm_va_end;var a_=env._tmpfile;var a$=env._snprintf;var a0=env._fgetc;var a1=env._readdir;var a2=env._close;var a3=env._getgid;var a4=env._strchr;var a5=env.___setErrNo;var a6=env._ftell;var a7=env._exit;var a8=env._sprintf;var a9=env._strrchr;var ba=env._fcntl;var bb=env._fmod;var bc=env._strcspn;var bd=env._ferror;var be=env._llvm_uadd_with_overflow_i32;var bf=env._localtime_r;var bg=env._wait;var bh=env._cos;var bi=env._putchar;var bj=env._putenv;var bk=env._islower;var bl=env.__exit;var bm=env._isupper;var bn=env._strncmp;var bo=env._tzset;var bp=env._chmod;var bq=env._isprint;var br=env._toupper;var bs=env._printf;var bt=env._pread;var bu=env._fopen;var bv=env._open;var bw=env._usleep;var bx=env._frexp;var by=env._log;var bz=env._isalnum;var bA=env._fdopen;var bB=env._qsort;var bC=env._isalpha;var bD=env._dup;var bE=env._fork;var bF=env._srand;var bG=env._isatty;var bH=env.__formatString;var bI=env._getenv;var bJ=env._atoi;var bK=env._llvm_bswap_i16;var bL=env._chdir;var bM=env._llvm_pow_f64;var bN=env._sbrk;var bO=env.___errno_location;var bP=env._strerror;var bQ=env._fstat;var bR=env._llvm_lifetime_start;var bS=env._llvm_bswap_i32;var bT=env.__parseInt;var bU=env._ungetc;var bV=env._vsprintf;var bW=env._rename;var bX=env._feof;var bY=env._sysconf;var bZ=env._fread;var b_=env._abort;var b$=env._fprintf;var b0=env.___buildEnvironment;var b1=env.__reallyNegative;var b2=env._iscntrl;var b3=env._ispunct;var b4=env._clearerr;var b5=env._floor;var b6=env._fseek;var b7=env._modf;var b8=env._sqrt;var b9=env._write;var ca=env._sin;var cb=env._stat;var cc=env._longjmp;var cd=env._readdir_r;var ce=env._closedir;var cf=env._unlink;var cg=env._pwrite;var ch=env._strerror_r;var ci=env._pipe;var cj=env._atan2;var ck=env._exp;var cl=env._time;
// EMSCRIPTEN_START_FUNCS
function r6(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=c[23072]|0;g=c[c[f+12>>2]>>2]|0;if((g|0)==0){h=c[c[(dr(f,0)|0)+12>>2]>>2]|0}else{h=g}g=a[76816]|0;a[76816]=0;oa(h);f=c[19996]|0;L24782:do{if((f|0)==0|(f&64|0)==0){i=c[e>>2]|0;j=c[i+28>>2]|0;if((d|0)==0){k=c[j+8>>2]|0;do{if((k&49152|0)==32768){if(((k&255)-9|0)>>>0>=2){l=0;break}l=c[(c[j+12>>2]|0)+32>>2]|0}else{l=0}}while(0);dH(h,(l|0)!=0?l:j,0,1);break}do{if((b[i+48>>1]&192)<<16>>16==0){if((aX((c[(c[j>>2]|0)+16>>2]|0)+8|0,18504)|0)==0){break}do{if((c[(c[j+12>>2]|0)+8>>2]|0)==(e|0)){if(r7(j)<<24>>24==0){m=18176;break}else{n=j;break}}else{m=18176}}while(0);if((m|0)==18176){k=c[d>>2]|0;if((c[k+8>>2]&255|0)!=9){break}o=k;if((c[(c[k+12>>2]|0)+8>>2]|0)!=(e|0)){break}if(r7(o)<<24>>24==0){break}else{n=o}}o=n|0;k=c[(c[o>>2]|0)+24>>2]|0;do{if((c[k+8>>2]&33554432|0)==0){p=0}else{q=c[(c[k>>2]|0)+12>>2]|0;r=c[k+12>>2]|0;s=c[r+(q+1<<2)>>2]|0;if((s|0)==0){p=0;break}t=c[r+(q+5<<2)>>2]|0;if((t|0)>0){p=c[s>>2]|0;break}if((t|0)<-1){p=c[s+4>>2]|0;break}else{p=(t|0)==-1?0:s;break}}}while(0);oT(h,p);oW(h,18192,2,2);k=c[(c[o>>2]|0)+16>>2]|0;s=c[k+4>>2]|0;oW(h,k+8|0,s,(a[(s+1|0)+(k+8)|0]&1)<<24>>24!=0?32768:16384);break L24782}}while(0);j=e+4|0;c[j>>2]=(c[j>>2]|0)+1|0;j=c[19216]|0;if((j|0)==0){i=rk(4080)|0;k=i;c[i>>2]=c[19230]|0;s=i+4|0;c[s>>2]=255;c[i+8>>2]=0;c[19230]=k;t=i+16|0;c[19216]=t;i=k+((c[s>>2]|0)-1<<4)|0;L24818:do{if(t>>>0<i>>>0){s=t;while(1){k=s+16|0;c[s>>2]=k;c[s+8>>2]=255;if(k>>>0<i>>>0){s=k}else{u=k;break L24818}}}else{u=t}}while(0);c[u>>2]=0;c[u+8>>2]=255;v=c[19216]|0}else{v=j}t=v|0;c[19216]=c[t>>2]|0;c[19228]=(c[19228]|0)+1|0;c[t>>2]=0;i=v+4|0;c[i>>2]=1;s=v+8|0;c[s>>2]=0;op(v,2);o=e+8|0;c[o>>2]=c[o>>2]&-524289;c[v+12>>2]=e;c[s>>2]=c[s>>2]|2048;oQ(h,v,1538);if((v|0)==0){break}o=c[i>>2]|0;if((o|0)==0){ol(v);break}k=o-1|0;c[i>>2]=k;if((k|0)!=0){break}do{if((c[s>>2]&134217728|0)!=0){if(!((v|0)==76848|(v|0)==76832|(v|0)==76896|(v|0)==76872)){break}c[i>>2]=2147483647;break L24782}}while(0);o6(v);if((c[i>>2]|0)!=0){break}j=c[s>>2]|0;c[s>>2]=255;if((j&67108864|0)==0){c[t>>2]=c[19216]|0;c[19216]=v}c[19228]=(c[19228]|0)-1|0}else{j=h+8|0;k=c[j>>2]|0;o=k&255;if(o>>>0<5&(o|0)!=2){op(h,5);w=c[j>>2]|0}else{w=k}c[j>>2]=w|4352;c[(c[h>>2]|0)+16>>2]=e}}while(0);if(g<<24>>24==0){return}a[76816]=1;return}function r7(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=c[b>>2]|0;e=c[d+24>>2]|0;if((e|0)==0){f=0;return f|0}if((c[e+8>>2]&33554432|0)==0){f=0;return f|0}g=c[(c[e>>2]|0)+12>>2]|0;h=c[e+12>>2]|0;i=c[h+(g+1<<2)>>2]|0;j=i;if((i|0)==0){f=0;return f|0}k=c[h+(g+5<<2)>>2]|0;if((k|0)==-1){f=0;return f|0}do{if((k|0)>0){l=c[i>>2]|0}else{if((k|0)>=-1){l=j;break}l=c[i+4>>2]|0}}while(0);if((l+8|0)==0){f=0;return f|0}l=c[d+16>>2]|0;d=c[l+4>>2]|0;i=(a[(d+1|0)+(l+8)|0]&1)<<24>>24!=0?-d|0:d;d=dT(e,0,l+8|0,(i|0)<0?-i|0:i,i>>>31,32,0,0)|0;if((d|0)==0){f=0;return f|0}f=(c[d>>2]|0)==(b|0)&1;return f|0}function r8(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+24|0;h=g|0;do{if((e|0)==8){j=a[d]|0;if((j|0)==65){if((a[d+1|0]|0)!=85){break}if((a[d+2|0]|0)!=84){break}if((a[d+3|0]|0)!=79){break}if((a[d+4|0]|0)!=76){break}if((a[d+5|0]|0)!=79){break}if((a[d+6|0]|0)!=65){break}if((a[d+7|0]|0)==68){k=7}else{break}i=g;return k|0}else if((j|0)==101){if((a[d+1|0]|0)!=110){break}if((a[d+2|0]|0)!=100){break}l=a[d+3|0]|0;if((l|0)==103){if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)!=110){break}if((a[d+7|0]|0)==116){k=-50}else{break}i=g;return k|0}else if((l|0)==112){if((a[d+4|0]|0)!=119){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)!=110){break}if((a[d+7|0]|0)==116){k=-54}else{break}i=g;return k|0}else{break}}else if((j|0)==100){if((a[d+1|0]|0)!=98){break}if((a[d+2|0]|0)!=109){break}if((a[d+3|0]|0)!=99){break}if((a[d+4|0]|0)!=108){break}if((a[d+5|0]|0)!=111){break}if((a[d+6|0]|0)!=115){break}if((a[d+7|0]|0)==101){k=-39}else{break}i=g;return k|0}else if((j|0)==115){l=a[d+1|0]|0;if((l|0)==101){if((a[d+2|0]|0)!=116){break}m=a[d+3|0]|0;if((m|0)==103){if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)!=110){break}if((a[d+7|0]|0)==116){k=-187}else{break}i=g;return k|0}else if((m|0)==112){if((a[d+4|0]|0)!=119){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)!=110){break}if((a[d+7|0]|0)==116){k=-193}else{break}i=g;return k|0}else{break}}else if((l|0)==121){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)!=119){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)==101){k=-223}else{break}i=g;return k|0}else if((l|0)==104){l=a[d+2|0]|0;if((l|0)==117){if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=100){break}if((a[d+5|0]|0)!=111){break}if((a[d+6|0]|0)!=119){break}if((a[d+7|0]|0)==110){k=-201}else{break}i=g;return k|0}else if((l|0)==109){if((a[d+3|0]|0)!=119){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)==101){k=-200}else{break}i=g;return k|0}else{break}}else{break}}else if((j|0)==99){l=a[d+1|0]|0;if((l|0)==108){if((a[d+2|0]|0)!=111){break}if((a[d+3|0]|0)!=115){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=100){break}if((a[d+6|0]|0)!=105){break}if((a[d+7|0]|0)==114){k=-33}else{break}i=g;return k|0}else if((l|0)==111){if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=105){break}if((a[d+5|0]|0)!=110){break}if((a[d+6|0]|0)!=117){break}if((a[d+7|0]|0)==101){k=-36}else{break}i=g;return k|0}else{break}}else if((j|0)==114){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)!=100){break}l=a[d+4|0]|0;if((l|0)==112){if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)!=112){break}if((a[d+7|0]|0)==101){k=-165}else{break}i=g;return k|0}else if((l|0)!=108){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)!=110){break}l=a[d+7|0]|0;if((l|0)==101){k=-163;i=g;return k|0}else if((l|0)!=107){break}k=-164;i=g;return k|0}else if((j|0)==95){if((a[d+1|0]|0)!=95){break}l=a[d+2|0]|0;if((l|0)==70){if((a[d+3|0]|0)!=73){break}if((a[d+4|0]|0)!=76){break}if((a[d+5|0]|0)!=69){break}if((a[d+6|0]|0)!=95){break}if((a[d+7|0]|0)==95){k=-1}else{break}i=g;return k|0}else if((l|0)==76){if((a[d+3|0]|0)!=73){break}if((a[d+4|0]|0)!=78){break}if((a[d+5|0]|0)!=69){break}if((a[d+6|0]|0)!=95){break}if((a[d+7|0]|0)==95){k=-2}else{break}i=g;return k|0}else if((l|0)==68){if((a[d+3|0]|0)!=65){break}if((a[d+4|0]|0)!=84){break}if((a[d+5|0]|0)!=65){break}if((a[d+6|0]|0)!=95){break}if((a[d+7|0]|0)==95){k=4}else{break}i=g;return k|0}else{break}}else if((j|0)==103){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}l=a[d+3|0]|0;if((l|0)==108){if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=103){break}if((a[d+6|0]|0)!=105){break}if((a[d+7|0]|0)==110){k=-81}else{break}i=g;return k|0}else if((l|0)==112){if((a[d+4|0]|0)!=119){break}m=a[d+5|0]|0;if((m|0)==101){if((a[d+6|0]|0)!=110){break}if((a[d+7|0]|0)==116){k=-92}else{break}i=g;return k|0}else if((m|0)==110){if((a[d+6|0]|0)!=97){break}if((a[d+7|0]|0)==109){k=-93}else{break}i=g;return k|0}else if((m|0)==117){if((a[d+6|0]|0)!=105){break}if((a[d+7|0]|0)==100){k=-94}else{break}i=g;return k|0}else{break}}else if((l|0)==103){if((a[d+4|0]|0)!=114){break}l=a[d+5|0]|0;if((l|0)==103){if((a[d+6|0]|0)!=105){break}if((a[d+7|0]|0)==100){k=-76}else{break}i=g;return k|0}else if((l|0)==110){if((a[d+6|0]|0)!=97){break}if((a[d+7|0]|0)==109){k=-77}else{break}i=g;return k|0}else if((l|0)==101){if((a[d+6|0]|0)!=110){break}if((a[d+7|0]|0)==116){k=-75}else{break}i=g;return k|0}else{break}}else{break}}else if((j|0)==102){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)!=109){break}if((a[d+4|0]|0)!=108){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)!=110){break}if((a[d+7|0]|0)==101){k=-72}else{break}i=g;return k|0}else if((j|0)==116){if((a[d+1|0]|0)!=114){break}if((a[d+2|0]|0)!=117){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=99){break}if((a[d+5|0]|0)!=97){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)==101){k=-231}else{break}i=g;return k|0}else{break}}else if((e|0)==1){j=a[d]|0;if((j|0)==120){k=-253;i=g;return k|0}else if((j|0)==121){k=255;i=g;return k|0}else if((j|0)==115){k=177;i=g;return k|0}else if((j|0)==109){k=127;i=g;return k|0}else if((j|0)==113){k=154;i=g;return k|0}else{break}}else if((e|0)==5){j=a[d]|0;if((j|0)==116){if((a[d+1|0]|0)!=105){break}if((a[d+2|0]|0)!=109){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)==115){k=-229}else{break}i=g;return k|0}else if((j|0)==66){if((a[d+1|0]|0)!=69){break}if((a[d+2|0]|0)!=71){break}if((a[d+3|0]|0)!=73){break}if((a[d+4|0]|0)==78){k=8}else{break}i=g;return k|0}else if((j|0)==67){if((a[d+1|0]|0)!=72){break}if((a[d+2|0]|0)!=69){break}if((a[d+3|0]|0)!=67){break}if((a[d+4|0]|0)==75){k=14}else{break}i=g;return k|0}else if((j|0)==98){l=a[d+1|0]|0;if((l|0)==108){if((a[d+2|0]|0)!=101){break}if((a[d+3|0]|0)!=115){break}if((a[d+4|0]|0)==115){k=-22}else{break}i=g;return k|0}else if((l|0)!=114){break}if((a[d+2|0]|0)!=101){break}if((a[d+3|0]|0)!=97){break}if((a[d+4|0]|0)!=107){break}if(f<<24>>24!=0){k=-23;i=g;return k|0}l=c[22210]|0;m=c[((l|0)==88936?87272:l+32|0)>>2]|0;if((m&469762048|0)!=0&(m&268435456)>>>0<268435456){k=-23;i=g;return k|0}if((m&469893120|0)!=469893120){k=0;i=g;return k|0}m=h|0;si(m|0,75488,17);n=h+8|0;a[n]=a[53040]|0;a[n+1|0]=a[53041|0]|0;a[n+2|0]=a[53042|0]|0;a[n+3|0]=a[53043|0]|0;a[n+4|0]=a[53044|0]|0;a[n+5|0]=a[53045|0]|0;k=(ej(c[l+44>>2]|0,m,14,0,2)|0)!=0?-23:0;i=g;return k|0}else if((j|0)==102){m=a[d+1|0]|0;if((m|0)==108){if((a[d+2|0]|0)!=111){break}if((a[d+3|0]|0)!=99){break}if((a[d+4|0]|0)==107){k=-67}else{break}i=g;return k|0}else if((m|0)==99){if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)==108){k=-65}else{break}i=g;return k|0}else{break}}else if((j|0)==112){if((a[d+1|0]|0)!=114){break}if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)==116){k=150}else{break}i=g;return k|0}else if((j|0)==119){m=a[d+1|0]|0;if((m|0)==114){if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)==101){k=-252}else{break}i=g;return k|0}else if((m|0)==104){if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=108){break}if((a[d+4|0]|0)==101){k=251}else{break}i=g;return k|0}else{break}}else if((j|0)==108){m=a[d+1|0]|0;if((m|0)==111){if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)!=97){break}if((a[d+4|0]|0)==108){k=121}else{break}i=g;return k|0}else if((m|0)==115){if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=97){break}if((a[d+4|0]|0)==116){k=-125}else{break}i=g;return k|0}else{break}}else if((j|0)==109){if((a[d+1|0]|0)!=107){break}if((a[d+2|0]|0)!=100){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)==114){k=-129}else{break}i=g;return k|0}else if((j|0)==117){m=a[d+1|0]|0;if((m|0)==116){if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=109){break}if((a[d+4|0]|0)==101){k=-243}else{break}i=g;return k|0}else if((m|0)==109){if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)!=115){break}if((a[d+4|0]|0)==107){k=-234}else{break}i=g;return k|0}else if((m|0)==110){m=a[d+2|0]|0;if((m|0)==100){if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)==102){k=235}else{break}i=g;return k|0}else if((m|0)!=116){break}if((a[d+3|0]|0)!=105){break}m=a[d+4|0]|0;if((m|0)==101){k=-240;i=g;return k|0}else if((m|0)!=108){break}k=241;i=g;return k|0}else{break}}else if((j|0)==101){if((a[d+1|0]|0)!=108){break}if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)==102){k=49}else{break}i=g;return k|0}else if((j|0)==105){m=a[d+1|0]|0;if((m|0)==111){if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)==108){k=-110}else{break}i=g;return k|0}else if((m|0)==110){if((a[d+2|0]|0)!=100){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)==120){k=-108}else{break}i=g;return k|0}else{break}}else if((j|0)==103){if((a[d+1|0]|0)!=105){break}if((a[d+2|0]|0)!=118){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=110){break}if(f<<24>>24!=0){k=100;i=g;return k|0}m=c[22210]|0;l=c[((m|0)==88936?87272:m+32|0)>>2]|0;if((l&469762048|0)!=0&(l&268435456)>>>0<268435456){k=100;i=g;return k|0}if((l&469893120|0)!=469893120){k=0;i=g;return k|0}l=h|0;si(l|0,75488,17);n=h+8|0;a[n]=a[53040]|0;a[n+1|0]=a[53041|0]|0;a[n+2|0]=a[53042|0]|0;a[n+3|0]=a[53043|0]|0;a[n+4|0]=a[53044|0]|0;a[n+5|0]=a[53045|0]|0;k=(ej(c[m+44>>2]|0,l,14,0,2)|0)!=0?100:0;i=g;return k|0}else if((j|0)==99){l=a[d+1|0]|0;if((l|0)==108){if((a[d+2|0]|0)!=111){break}if((a[d+3|0]|0)!=115){break}if((a[d+4|0]|0)==101){k=-32}else{break}i=g;return k|0}else if((l|0)==104){m=a[d+2|0]|0;if((m|0)==109){if((a[d+3|0]|0)!=111){break}if((a[d+4|0]|0)==100){k=-26}else{break}i=g;return k|0}else if((m|0)==111){n=a[d+3|0]|0;if((n|0)==109){if((a[d+4|0]|0)==112){k=-27}else{break}i=g;return k|0}else if((n|0)==119){if((a[d+4|0]|0)==110){k=-29}else{break}i=g;return k|0}else{break}}else if((m|0)==100){if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)==114){k=-25}else{break}i=g;return k|0}else{break}}else if((l|0)==114){if((a[d+2|0]|0)!=121){break}if((a[d+3|0]|0)!=112){break}if((a[d+4|0]|0)==116){k=-38}else{break}i=g;return k|0}else{break}}else if((j|0)==97){l=a[d+1|0]|0;if((l|0)==108){if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)!=114){break}if((a[d+4|0]|0)==109){k=-17}else{break}i=g;return k|0}else if((l|0)==116){if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)==50){k=-19}else{break}i=g;return k|0}else{break}}else if((j|0)==115){l=a[d+1|0]|0;if((l|0)==112){if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)==116){k=208}else{break}i=g;return k|0}else if((l|0)==114){if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)==100){k=-211}else{break}i=g;return k|0}else if((l|0)==108){if((a[d+2|0]|0)!=101){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)==112){k=-203}else{break}i=g;return k|0}else if((l|0)==116){m=a[d+2|0]|0;if((m|0)==117){if((a[d+3|0]|0)!=100){break}if((a[d+4|0]|0)==121){k=214}else{break}i=g;return k|0}else if((m|0)!=97){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=101){break}if(f<<24>>24!=0){k=213;i=g;return k|0}m=c[22210]|0;n=c[((m|0)==88936?87272:m+32|0)>>2]|0;if((n&469762048|0)!=0&(n&268435456)>>>0<268435456){k=213;i=g;return k|0}if((n&469893120|0)!=469893120){k=0;i=g;return k|0}n=h|0;si(n|0,75488,17);o=h+8|0;a[o]=a[43728]|0;a[o+1|0]=a[43729|0]|0;a[o+2|0]=a[43730|0]|0;a[o+3|0]=a[43731|0]|0;a[o+4|0]=a[43732|0]|0;k=(ej(c[m+44>>2]|0,n,13,0,2)|0)!=0?213:0;i=g;return k|0}else if((l|0)==101){if((a[d+2|0]|0)!=109){break}if((a[d+3|0]|0)!=111){break}if((a[d+4|0]|0)==112){k=-185}else{break}i=g;return k|0}else if((l|0)==104){if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=102){break}if((a[d+4|0]|0)==116){k=-196}else{break}i=g;return k|0}else{break}}else if((j|0)==114){j=a[d+1|0]|0;if((j|0)==101){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)==116){k=-171}else{break}i=g;return k|0}else if((j|0)==109){if((a[d+2|0]|0)!=100){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)==114){k=-176}else{break}i=g;return k|0}else{break}}else{break}}else if((e|0)==4){j=a[d]|0;if((j|0)==108){l=a[d+1|0]|0;if((l|0)==97){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)==116){k=114}else{break}i=g;return k|0}else if((l|0)==105){if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)==107){k=-119}else{break}i=g;return k|0}else if((l|0)==111){if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)==107){k=-123}else{break}i=g;return k|0}else{break}}else if((j|0)==114){l=a[d+1|0]|0;if((l|0)==97){if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)==100){k=-160}else{break}i=g;return k|0}else if((l|0)!=101){break}l=a[d+2|0]|0;if((l|0)==100){if((a[d+3|0]|0)==111){k=167}else{break}i=g;return k|0}else if((l|0)==97){if((a[d+3|0]|0)==100){k=-161}else{break}i=g;return k|0}else if((l|0)==99){if((a[d+3|0]|0)==118){k=-166}else{break}i=g;return k|0}else{break}}else if((j|0)==111){if((a[d+1|0]|0)!=112){break}if((a[d+2|0]|0)!=101){break}if((a[d+3|0]|0)==110){k=-140}else{break}i=g;return k|0}else if((j|0)==106){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)==110){k=-111}else{break}i=g;return k|0}else if((j|0)==107){l=a[d+1|0]|0;if((l|0)==101){if((a[d+2|0]|0)!=121){break}if((a[d+3|0]|0)==115){k=-112}else{break}i=g;return k|0}else if((l|0)==105){if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)==108){k=-113}else{break}i=g;return k|0}else{break}}else if((j|0)==110){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=120){break}if((a[d+3|0]|0)==116){k=136}else{break}i=g;return k|0}else if((j|0)==73){if((a[d+1|0]|0)!=78){break}if((a[d+2|0]|0)!=73){break}if((a[d+3|0]|0)==84){k=13}else{break}i=g;return k|0}else if((j|0)==67){if((a[d+1|0]|0)!=79){break}if((a[d+2|0]|0)!=82){break}if((a[d+3|0]|0)==69){k=-10}else{break}i=g;return k|0}else if((j|0)==99){if((a[d+1|0]|0)!=104){break}if((a[d+2|0]|0)!=111){break}if((a[d+3|0]|0)==112){k=-28}else{break}i=g;return k|0}else if((j|0)==115){l=a[d+1|0]|0;if((l|0)==111){if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)==116){k=206}else{break}i=g;return k|0}else if((l|0)==101){n=a[d+2|0]|0;if((n|0)==110){if((a[d+3|0]|0)==100){k=-186}else{break}i=g;return k|0}else if((n|0)==101){if((a[d+3|0]|0)==107){k=-180}else{break}i=g;return k|0}else{break}}else if((l|0)==116){if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)==116){k=-212}else{break}i=g;return k|0}else if((l|0)==113){if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)==116){k=-210}else{break}i=g;return k|0}else{break}}else if((j|0)==102){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)==107){k=-70}else{break}i=g;return k|0}else if((j|0)==119){l=a[d+1|0]|0;if((l|0)==97){n=a[d+2|0]|0;if((n|0)==105){if((a[d+3|0]|0)==116){k=-246}else{break}i=g;return k|0}else if((n|0)==114){if((a[d+3|0]|0)==110){k=-249}else{break}i=g;return k|0}else{break}}else if((l|0)!=104){break}if((a[d+2|0]|0)!=101){break}if((a[d+3|0]|0)!=110){break}if(f<<24>>24!=0){k=250;i=g;return k|0}l=c[22210]|0;n=c[((l|0)==88936?87272:l+32|0)>>2]|0;if((n&469762048|0)!=0&(n&268435456)>>>0<268435456){k=250;i=g;return k|0}if((n&469893120|0)!=469893120){k=0;i=g;return k|0}n=h|0;si(n|0,75488,17);m=h+8|0;a[m]=a[53040]|0;a[m+1|0]=a[53041|0]|0;a[m+2|0]=a[53042|0]|0;a[m+3|0]=a[53043|0]|0;a[m+4|0]=a[53044|0]|0;a[m+5|0]=a[53045|0]|0;k=(ej(c[l+44>>2]|0,n,14,0,2)|0)!=0?250:0;i=g;return k|0}else if((j|0)==101){n=a[d+1|0]|0;if((n|0)==108){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)==101){k=48}else{break}i=g;return k|0}else if((n|0)==120){l=a[d+2|0]|0;if((l|0)==105){if((a[d+3|0]|0)==116){k=-62}else{break}i=g;return k|0}else if((l|0)==101){if((a[d+3|0]|0)==99){k=-60}else{break}i=g;return k|0}else{break}}else if((n|0)==118){if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)==108){k=58}else{break}i=g;return k|0}else if((n|0)==97){if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)==104){k=-47}else{break}i=g;return k|0}else{break}}else if((j|0)==103){n=a[d+1|0]|0;if((n|0)==111){if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)==111){k=103}else{break}i=g;return k|0}else if((n|0)==108){if((a[d+2|0]|0)!=111){break}if((a[d+3|0]|0)==98){k=101}else{break}i=g;return k|0}else if((n|0)==101){if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)==99){k=-74}else{break}i=g;return k|0}else if((n|0)==114){if((a[d+2|0]|0)!=101){break}if((a[d+3|0]|0)==112){k=104}else{break}i=g;return k|0}else{break}}else if((j|0)==100){if((a[d+1|0]|0)!=117){break}if((a[d+2|0]|0)!=109){break}if((a[d+3|0]|0)==112){k=-46}else{break}i=g;return k|0}else if((j|0)==98){if((a[d+1|0]|0)!=105){break}if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)==100){k=-20}else{break}i=g;return k|0}else if((j|0)==112){n=a[d+1|0]|0;if((n|0)==105){if((a[d+2|0]|0)!=112){break}if((a[d+3|0]|0)==101){k=-147}else{break}i=g;return k|0}else if((n|0)==117){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)==104){k=-153}else{break}i=g;return k|0}else if((n|0)==97){if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)==107){k=-145}else{break}i=g;return k|0}else{break}}else if((j|0)==116){j=a[d+1|0]|0;if((j|0)==101){if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)==108){k=-224}else{break}i=g;return k|0}else if((j|0)!=105){break}j=a[d+2|0]|0;if((j|0)==101){if((a[d+3|0]|0)==100){k=-227}else{break}i=g;return k|0}else if((j|0)==109){if((a[d+3|0]|0)==101){k=-228}else{break}i=g;return k|0}else{break}}else{break}}else if((e|0)==3){j=a[d]|0;if((j|0)==117){if((a[d+1|0]|0)!=115){break}if((a[d+2|0]|0)==101){k=242}else{break}i=g;return k|0}else if((j|0)==99){n=a[d+1|0]|0;if((n|0)==104){if((a[d+2|0]|0)==114){k=-30}else{break}i=g;return k|0}else if((n|0)==109){if((a[d+2|0]|0)==112){k=-34}else{break}i=g;return k|0}else if((n|0)==111){if((a[d+2|0]|0)==115){k=-37}else{break}i=g;return k|0}else{break}}else if((j|0)==108){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)==103){k=-124}else{break}i=g;return k|0}else if((j|0)==97){n=a[d+1|0]|0;if((n|0)==98){if((a[d+2|0]|0)==115){k=-15}else{break}i=g;return k|0}else if((n|0)==110){if((a[d+2|0]|0)==100){k=-18}else{break}i=g;return k|0}else{break}}else if((j|0)==116){if((a[d+1|0]|0)!=105){break}if((a[d+2|0]|0)==101){k=-226}else{break}i=g;return k|0}else if((j|0)==111){n=a[d+1|0]|0;if((n|0)==117){if((a[d+2|0]|0)==114){k=144}else{break}i=g;return k|0}else if((n|0)==114){if((a[d+2|0]|0)==100){k=-143}else{break}i=g;return k|0}else if((n|0)==99){if((a[d+2|0]|0)==116){k=-139}else{break}i=g;return k|0}else{break}}else if((j|0)==118){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)==99){k=-245}else{break}i=g;return k|0}else if((j|0)==105){if((a[d+1|0]|0)!=110){break}if((a[d+2|0]|0)==116){k=-109}else{break}i=g;return k|0}else if((j|0)==100){if((a[d+1|0]|0)!=105){break}if((a[d+2|0]|0)==101){k=-44}else{break}i=g;return k|0}else if((j|0)==114){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)==102){k=-168}else{break}i=g;return k|0}else if((j|0)==112){if((a[d+1|0]|0)!=111){break}n=a[d+2|0]|0;if((n|0)==112){k=-148;i=g;return k|0}else if((n|0)!=115){break}k=149;i=g;return k|0}else if((j|0)==102){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)==114){k=68}else{break}i=g;return k|0}else if((j|0)==69){if((a[d+1|0]|0)!=78){break}if((a[d+2|0]|0)==68){k=12}else{break}i=g;return k|0}else if((j|0)==104){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)==120){k=-106}else{break}i=g;return k|0}else if((j|0)==115){n=a[d+1|0]|0;if((n|0)==97){if((a[d+2|0]|0)!=121){break}if(f<<24>>24!=0){k=178;i=g;return k|0}l=c[22210]|0;m=c[((l|0)==88936?87272:l+32|0)>>2]|0;if((m&469762048|0)!=0&(m&268435456)>>>0<268435456){k=178;i=g;return k|0}if((m&469893120|0)!=469893120){k=0;i=g;return k|0}m=h|0;si(m|0,75488,17);o=h+8|0;a[o]=a[64856]|0;a[o+1|0]=a[64857|0]|0;a[o+2|0]=a[64858|0]|0;k=(ej(c[l+44>>2]|0,m,11,0,2)|0)!=0?178:0;i=g;return k|0}else if((n|0)==117){if((a[d+2|0]|0)==98){k=215}else{break}i=g;return k|0}else if((n|0)==105){if((a[d+2|0]|0)==110){k=-202}else{break}i=g;return k|0}else{break}}else if((j|0)==110){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)==116){k=-138}else{break}i=g;return k|0}else if((j|0)==120){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)==114){k=-254}else{break}i=g;return k|0}else if((j|0)==109){if((a[d+1|0]|0)!=97){break}if((a[d+2|0]|0)==112){k=128}else{break}i=g;return k|0}else if((j|0)==101){j=a[d+1|0]|0;if((j|0)==111){if((a[d+2|0]|0)==102){k=-56}else{break}i=g;return k|0}else if((j|0)==120){if((a[d+2|0]|0)==112){k=-63}else{break}i=g;return k|0}else{break}}else{break}}else if((e|0)==2){j=a[d]|0;if((j|0)==110){n=a[d+1|0]|0;if((n|0)==101){k=-135;i=g;return k|0}else if((n|0)!=111){break}k=137;i=g;return k|0}else if((j|0)==100){if((a[d+1|0]|0)==111){k=45}else{break}i=g;return k|0}else if((j|0)==113){n=a[d+1|0]|0;if((n|0)==113){k=155;i=g;return k|0}else if((n|0)==114){k=156;i=g;return k|0}else if((n|0)==119){k=158;i=g;return k|0}else if((n|0)==120){k=159;i=g;return k|0}else{break}}else if((j|0)==102){if((a[d+1|0]|0)!=99){break}if(f<<24>>24!=0){k=-64;i=g;return k|0}n=c[22210]|0;m=c[((n|0)==88936?87272:n+32|0)>>2]|0;if((m&469762048|0)==201326592){k=-64;i=g;return k|0}if((m&469893120|0)!=469893120){k=0;i=g;return k|0}m=h|0;si(m|0,75488,17);b[h+8>>1]=25446;k=(ej(c[n+44>>2]|0,m,10,0,2)|0)!=0?-64:0;i=g;return k|0}else if((j|0)==111){if((a[d+1|0]|0)==114){k=-142}else{break}i=g;return k|0}else if((j|0)==101){if((a[d+1|0]|0)==113){k=-57}else{break}i=g;return k|0}else if((j|0)==105){if((a[d+1|0]|0)==102){k=107}else{break}i=g;return k|0}else if((j|0)==103){m=a[d+1|0]|0;if((m|0)==101){k=-73;i=g;return k|0}else if((m|0)!=116){break}k=-105;i=g;return k|0}else if((j|0)==109){if((a[d+1|0]|0)==121){k=134}else{break}i=g;return k|0}else if((j|0)==116){if((a[d+1|0]|0)==114){k=230}else{break}i=g;return k|0}else if((j|0)==117){if((a[d+1|0]|0)==99){k=-232}else{break}i=g;return k|0}else if((j|0)==108){j=a[d+1|0]|0;if((j|0)==101){k=-117;i=g;return k|0}else if((j|0)==116){k=-126;i=g;return k|0}else if((j|0)==99){k=-115;i=g;return k|0}else{break}}else{break}}else if((e|0)==6){j=a[d]|0;if((j|0)==99){m=a[d+1|0]|0;if((m|0)==104){if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)!=111){break}if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)==116){k=-31}else{break}i=g;return k|0}else if((m|0)==97){if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)!=108){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==114){k=-24}else{break}i=g;return k|0}else{break}}else if((j|0)==112){if((a[d+1|0]|0)!=114){break}if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==102){k=151}else{break}i=g;return k|0}else if((j|0)==118){if((a[d+1|0]|0)!=97){break}if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)!=117){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==115){k=-244}else{break}i=g;return k|0}else if((j|0)==108){m=a[d+1|0]|0;if((m|0)==105){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==110){k=-120}else{break}i=g;return k|0}else if((m|0)==101){if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)!=103){break}if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==104){k=-118}else{break}i=g;return k|0}else{break}}else if((j|0)==103){if((a[d+1|0]|0)!=109){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)!=109){break}if((a[d+5|0]|0)==101){k=-102}else{break}i=g;return k|0}else if((j|0)==115){m=a[d+1|0]|0;if((m|0)==99){if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)!=108){break}if((a[d+4|0]|0)!=97){break}if((a[d+5|0]|0)==114){k=179}else{break}i=g;return k|0}else if((m|0)==101){n=a[d+2|0]|0;if((n|0)==108){if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=99){break}if((a[d+5|0]|0)==116){k=-182}else{break}i=g;return k|0}else if((n|0)!=109){break}n=a[d+3|0]|0;if((n|0)==99){if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==108){k=-183}else{break}i=g;return k|0}else if((n|0)==103){if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==116){k=-184}else{break}i=g;return k|0}else{break}}else if((m|0)==104){if((a[d+2|0]|0)!=109){break}n=a[d+3|0]|0;if((n|0)==99){if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==108){k=-197}else{break}i=g;return k|0}else if((n|0)==103){if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==116){k=-198}else{break}i=g;return k|0}else{break}}else if((m|0)==111){if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)!=107){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==116){k=-204}else{break}i=g;return k|0}else if((m|0)==112){if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)!=99){break}if((a[d+5|0]|0)==101){k=-207}else{break}i=g;return k|0}else if((m|0)==121){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==109){k=-222}else{break}i=g;return k|0}else if((m|0)==117){if((a[d+2|0]|0)!=98){break}if((a[d+3|0]|0)!=115){break}if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==114){k=-216}else{break}i=g;return k|0}else{break}}else if((j|0)==102){m=a[d+1|0]|0;if((m|0)==105){if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=110){break}if((a[d+5|0]|0)==111){k=-66}else{break}i=g;return k|0}else if((m|0)==111){if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)!=109){break}if((a[d+4|0]|0)!=97){break}if((a[d+5|0]|0)==116){k=71}else{break}i=g;return k|0}else{break}}else if((j|0)==109){if((a[d+1|0]|0)!=115){break}if((a[d+2|0]|0)!=103){break}m=a[d+3|0]|0;if((m|0)==99){if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==108){k=-130}else{break}i=g;return k|0}else if((m|0)==103){if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==116){k=-131}else{break}i=g;return k|0}else if((m|0)==114){if((a[d+4|0]|0)!=99){break}if((a[d+5|0]|0)==118){k=-132}else{break}i=g;return k|0}else if((m|0)==115){if((a[d+4|0]|0)!=110){break}if((a[d+5|0]|0)==100){k=-133}else{break}i=g;return k|0}else{break}}else if((j|0)==101){m=a[d+1|0]|0;if((m|0)==120){if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=115){break}if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==115){k=61}else{break}i=g;return k|0}else if((m|0)==108){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=105){break}if((a[d+5|0]|0)!=102){break}rJ(28,37080,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);break}else{break}}else if((j|0)==117){if((a[d+1|0]|0)!=110){break}m=a[d+2|0]|0;if((m|0)==112){if((a[d+3|0]|0)!=97){break}if((a[d+4|0]|0)!=99){break}if((a[d+5|0]|0)==107){k=-238}else{break}i=g;return k|0}else if((m|0)!=108){break}m=a[d+3|0]|0;if((m|0)==101){if((a[d+4|0]|0)!=115){break}if((a[d+5|0]|0)==115){k=236}else{break}i=g;return k|0}else if((m|0)==105){if((a[d+4|0]|0)!=110){break}if((a[d+5|0]|0)==107){k=-237}else{break}i=g;return k|0}else{break}}else if((j|0)==97){if((a[d+1|0]|0)!=99){break}if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=112){break}if((a[d+5|0]|0)==116){k=-16}else{break}i=g;return k|0}else if((j|0)==100){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=116){break}if((a[d+5|0]|0)==101){k=43}else{break}i=g;return k|0}else if((j|0)==114){j=a[d+1|0]|0;if((j|0)==105){if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)!=100){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)==120){k=-175}else{break}i=g;return k|0}else if((j|0)!=101){break}j=a[d+2|0]|0;if((j|0)==110){if((a[d+3|0]|0)!=97){break}if((a[d+4|0]|0)!=109){break}if((a[d+5|0]|0)==101){k=-169}else{break}i=g;return k|0}else if((j|0)==116){if((a[d+3|0]|0)!=117){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)==110){k=172}else{break}i=g;return k|0}else{break}}else{break}}else if((e|0)==7){j=a[d]|0;if((j|0)==95){if((a[d+1|0]|0)!=95){break}m=a[d+2|0]|0;if((m|0)==69){if((a[d+3|0]|0)!=78){break}if((a[d+4|0]|0)!=68){break}if((a[d+5|0]|0)!=95){break}if((a[d+6|0]|0)==95){k=5}else{break}i=g;return k|0}else if((m|0)!=83){break}if((a[d+3|0]|0)!=85){break}if((a[d+4|0]|0)!=66){break}if((a[d+5|0]|0)!=95){break}if((a[d+6|0]|0)!=95){break}if(f<<24>>24!=0){k=-6;i=g;return k|0}m=c[22210]|0;n=c[((m|0)==88936?87272:m+32|0)>>2]|0;if((n&469762048|0)==201326592){k=-6;i=g;return k|0}if((n&469893120|0)!=469893120){k=0;i=g;return k|0}n=h|0;si(n|0,75488,17);l=h+8|0;a[l]=a[31936]|0;a[l+1|0]=a[31937|0]|0;a[l+2|0]=a[31938|0]|0;a[l+3|0]=a[31939|0]|0;a[l+4|0]=a[31940|0]|0;a[l+5|0]=a[31941|0]|0;a[l+6|0]=a[31942|0]|0;k=(ej(c[m+44>>2]|0,n,15,0,2)|0)!=0?-6:0;i=g;return k|0}else if((j|0)==100){n=a[d+1|0]|0;if((n|0)==98){if((a[d+2|0]|0)!=109){break}if((a[d+3|0]|0)!=111){break}if((a[d+4|0]|0)!=112){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)==110){k=-40}else{break}i=g;return k|0}else if((n|0)!=101){break}if((a[d+2|0]|0)!=102){break}n=a[d+3|0]|0;if((n|0)==105){if((a[d+4|0]|0)!=110){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)==100){k=42}else{break}i=g;return k|0}else if((n|0)!=97){break}if((a[d+4|0]|0)!=117){break}if((a[d+5|0]|0)!=108){break}if((a[d+6|0]|0)!=116){break}if(f<<24>>24!=0){k=41;i=g;return k|0}n=c[22210]|0;m=c[((n|0)==88936?87272:n+32|0)>>2]|0;if((m&469762048|0)!=0&(m&268435456)>>>0<268435456){k=41;i=g;return k|0}if((m&469893120|0)!=469893120){k=0;i=g;return k|0}m=h|0;si(m|0,75488,17);l=h+8|0;a[l]=a[53040]|0;a[l+1|0]=a[53041|0]|0;a[l+2|0]=a[53042|0]|0;a[l+3|0]=a[53043|0]|0;a[l+4|0]=a[53044|0]|0;a[l+5|0]=a[53045|0]|0;k=(ej(c[n+44>>2]|0,m,14,0,2)|0)!=0?41:0;i=g;return k|0}else if((j|0)==112){if((a[d+1|0]|0)!=97){break}if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)!=107){break}if((a[d+4|0]|0)!=97){break}if((a[d+5|0]|0)!=103){break}if((a[d+6|0]|0)==101){k=146}else{break}i=g;return k|0}else if((j|0)==103){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=112){break}m=a[d+4|0]|0;if((m|0)==103){if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)==112){k=-86}else{break}i=g;return k|0}else if((m|0)==112){if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)==100){k=-87}else{break}i=g;return k|0}else{break}}else if((j|0)==98){if((a[d+1|0]|0)!=105){break}if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)!=109){break}if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=100){break}if((a[d+6|0]|0)==101){k=-21}else{break}i=g;return k|0}else if((j|0)==108){if((a[d+1|0]|0)!=99){break}if((a[d+2|0]|0)!=102){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=115){break}if((a[d+6|0]|0)==116){k=-116}else{break}i=g;return k|0}else if((j|0)==119){if((a[d+1|0]|0)!=97){break}if((a[d+2|0]|0)!=105){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=112){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)==100){k=-247}else{break}i=g;return k|0}else if((j|0)==68){if((a[d+1|0]|0)!=69){break}if((a[d+2|0]|0)!=83){break}if((a[d+3|0]|0)!=84){break}if((a[d+4|0]|0)!=82){break}if((a[d+5|0]|0)!=79){break}if((a[d+6|0]|0)==89){k=11}else{break}i=g;return k|0}else if((j|0)==102){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=97){break}if((a[d+5|0]|0)!=99){break}if((a[d+6|0]|0)==104){k=69}else{break}i=g;return k|0}else if((j|0)==114){if((a[d+1|0]|0)!=101){break}m=a[d+2|0]|0;if((m|0)==97){if((a[d+3|0]|0)!=100){break}if((a[d+4|0]|0)!=100){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)==114){k=-162}else{break}i=g;return k|0}else if((m|0)==113){if((a[d+3|0]|0)!=117){break}if((a[d+4|0]|0)!=105){break}if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)==101){k=170}else{break}i=g;return k|0}else if((m|0)==118){if((a[d+3|0]|0)!=101){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=115){break}if((a[d+6|0]|0)==101){k=-173}else{break}i=g;return k|0}else{break}}else if((j|0)==117){m=a[d+1|0]|0;if((m|0)==110){if((a[d+2|0]|0)!=115){break}if((a[d+3|0]|0)!=104){break}if((a[d+4|0]|0)!=105){break}if((a[d+5|0]|0)!=102){break}if((a[d+6|0]|0)==116){k=-239}else{break}i=g;return k|0}else if((m|0)==99){if((a[d+2|0]|0)!=102){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=115){break}if((a[d+6|0]|0)==116){k=-233}else{break}i=g;return k|0}else{break}}else if((j|0)==99){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=99){break}if((a[d+6|0]|0)==116){k=-35}else{break}i=g;return k|0}else if((j|0)==115){m=a[d+1|0]|0;if((m|0)==112){if((a[d+2|0]|0)!=114){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)!=110){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)==102){k=-209}else{break}i=g;return k|0}else if((m|0)==121){n=a[d+2|0]|0;if((n|0)==109){if((a[d+3|0]|0)!=108){break}if((a[d+4|0]|0)!=105){break}if((a[d+5|0]|0)!=110){break}if((a[d+6|0]|0)==107){k=-217}else{break}i=g;return k|0}else if((n|0)!=115){break}n=a[d+3|0]|0;if((n|0)==111){if((a[d+4|0]|0)!=112){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)==110){k=-219}else{break}i=g;return k|0}else if((n|0)==99){if((a[d+4|0]|0)!=97){break}if((a[d+5|0]|0)!=108){break}if((a[d+6|0]|0)==108){k=-218}else{break}i=g;return k|0}else if((n|0)==114){if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=97){break}if((a[d+6|0]|0)==100){k=-220}else{break}i=g;return k|0}else if((n|0)==115){if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)==107){k=-221}else{break}i=g;return k|0}else{break}}else if((m|0)==104){if((a[d+2|0]|0)!=109){break}if((a[d+3|0]|0)!=114){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=97){break}if((a[d+6|0]|0)==100){k=-199}else{break}i=g;return k|0}else if((m|0)==101){m=a[d+2|0]|0;if((m|0)==116){if((a[d+3|0]|0)!=112){break}if((a[d+4|0]|0)!=103){break}if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)==112){k=-190}else{break}i=g;return k|0}else if((m|0)==101){if((a[d+3|0]|0)!=107){break}if((a[d+4|0]|0)!=100){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)==114){k=-181}else{break}i=g;return k|0}else{break}}else{break}}else if((j|0)==116){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=108){break}if((a[d+3|0]|0)!=108){break}if((a[d+4|0]|0)!=100){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)==114){k=-225}else{break}i=g;return k|0}else if((j|0)==111){if((a[d+1|0]|0)!=112){break}if((a[d+2|0]|0)!=101){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=100){break}if((a[d+5|0]|0)!=105){break}if((a[d+6|0]|0)==114){k=-141}else{break}i=g;return k|0}else{break}}else if((e|0)==12){if((a[d]|0)!=103){break}if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)!=98){break}if((a[d+7|0]|0)!=121){break}j=a[d+8|0]|0;if((j|0)==97){if((a[d+9|0]|0)!=100){break}if((a[d+10|0]|0)!=100){break}if((a[d+11|0]|0)==114){k=-82}else{break}i=g;return k|0}else if((j|0)==110){if((a[d+9|0]|0)!=97){break}if((a[d+10|0]|0)!=109){break}if((a[d+11|0]|0)==101){k=-83}else{break}i=g;return k|0}else{break}}else if((e|0)==11){j=a[d]|0;if((j|0)==115){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=112){break}if((a[d+4|0]|0)!=114){break}m=a[d+5|0]|0;if((m|0)==111){if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=111){break}if((a[d+8|0]|0)!=101){break}if((a[d+9|0]|0)!=110){break}if((a[d+10|0]|0)==116){k=-192}else{break}i=g;return k|0}else if((m|0)==105){if((a[d+6|0]|0)!=111){break}if((a[d+7|0]|0)!=114){break}if((a[d+8|0]|0)!=105){break}if((a[d+9|0]|0)!=116){break}if((a[d+10|0]|0)==121){k=-191}else{break}i=g;return k|0}else{break}}else if((j|0)==95){if((a[d+1|0]|0)!=95){break}if((a[d+2|0]|0)!=80){break}if((a[d+3|0]|0)!=65){break}if((a[d+4|0]|0)!=67){break}if((a[d+5|0]|0)!=75){break}if((a[d+6|0]|0)!=65){break}if((a[d+7|0]|0)!=71){break}if((a[d+8|0]|0)!=69){break}if((a[d+9|0]|0)!=95){break}if((a[d+10|0]|0)==95){k=-3}else{break}i=g;return k|0}else if((j|0)==103){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}m=a[d+3|0]|0;if((m|0)==115){if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=99){break}if((a[d+6|0]|0)!=107){break}if((a[d+7|0]|0)!=110){break}if((a[d+8|0]|0)!=97){break}if((a[d+9|0]|0)!=109){break}if((a[d+10|0]|0)==101){k=-98}else{break}i=g;return k|0}else if((m|0)!=112){break}m=a[d+4|0]|0;if((m|0)==101){if((a[d+5|0]|0)!=101){break}if((a[d+6|0]|0)!=114){break}if((a[d+7|0]|0)!=110){break}if((a[d+8|0]|0)!=97){break}if((a[d+9|0]|0)!=109){break}if((a[d+10|0]|0)==101){k=-85}else{break}i=g;return k|0}else if((m|0)!=114){break}m=a[d+5|0]|0;if((m|0)==105){if((a[d+6|0]|0)!=111){break}if((a[d+7|0]|0)!=114){break}if((a[d+8|0]|0)!=105){break}if((a[d+9|0]|0)!=116){break}if((a[d+10|0]|0)==121){k=-88}else{break}i=g;return k|0}else if((m|0)==111){if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=111){break}if((a[d+8|0]|0)!=101){break}if((a[d+9|0]|0)!=110){break}if((a[d+10|0]|0)==116){k=-91}else{break}i=g;return k|0}else{break}}else if((j|0)==101){if((a[d+1|0]|0)!=110){break}if((a[d+2|0]|0)!=100){break}if((a[d+3|0]|0)!=112){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=111){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=111){break}if((a[d+8|0]|0)!=101){break}if((a[d+9|0]|0)!=110){break}if((a[d+10|0]|0)==116){k=-53}else{break}i=g;return k|0}else{break}}else if((e|0)==13){if((a[d]|0)!=103){break}if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}j=a[d+3|0]|0;if((j|0)==115){if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)!=118){break}if((a[d+7|0]|0)!=98){break}if((a[d+8|0]|0)!=121){break}m=a[d+9|0]|0;if((m|0)==110){if((a[d+10|0]|0)!=97){break}if((a[d+11|0]|0)!=109){break}if((a[d+12|0]|0)==101){k=-95}else{break}i=g;return k|0}else if((m|0)==112){if((a[d+10|0]|0)!=111){break}if((a[d+11|0]|0)!=114){break}if((a[d+12|0]|0)==116){k=-96}else{break}i=g;return k|0}else{break}}else if((j|0)==104){if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=115){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=98){break}if((a[d+8|0]|0)!=121){break}j=a[d+9|0]|0;if((j|0)==97){if((a[d+10|0]|0)!=100){break}if((a[d+11|0]|0)!=100){break}if((a[d+12|0]|0)==114){k=-78}else{break}i=g;return k|0}else if((j|0)==110){if((a[d+10|0]|0)!=97){break}if((a[d+11|0]|0)!=109){break}if((a[d+12|0]|0)==101){k=-79}else{break}i=g;return k|0}else{break}}else{break}}else if((e|0)==14){if((a[d]|0)!=103){break}if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=112){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=111){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=111){break}if((a[d+8|0]|0)!=98){break}if((a[d+9|0]|0)!=121){break}if((a[d+10|0]|0)!=110){break}if((a[d+11|0]|0)!=97){break}if((a[d+12|0]|0)!=109){break}if((a[d+13|0]|0)==101){k=-89}else{break}i=g;return k|0}else if((e|0)==16){if((a[d]|0)!=103){break}if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=112){break}if((a[d+4|0]|0)!=114){break}if((a[d+5|0]|0)!=111){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=111){break}if((a[d+8|0]|0)!=98){break}if((a[d+9|0]|0)!=121){break}if((a[d+10|0]|0)!=110){break}if((a[d+11|0]|0)!=117){break}if((a[d+12|0]|0)!=109){break}if((a[d+13|0]|0)!=98){break}if((a[d+14|0]|0)!=101){break}if((a[d+15|0]|0)==114){k=-90}else{break}i=g;return k|0}else if((e|0)==9){j=a[d]|0;if((j|0)==113){if((a[d+1|0]|0)!=117){break}if((a[d+2|0]|0)!=111){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=109){break}if((a[d+6|0]|0)!=101){break}if((a[d+7|0]|0)!=116){break}if((a[d+8|0]|0)==97){k=-157}else{break}i=g;return k|0}else if((j|0)==114){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=119){break}if((a[d+3|0]|0)!=105){break}if((a[d+4|0]|0)!=110){break}if((a[d+5|0]|0)!=100){break}if((a[d+6|0]|0)!=100){break}if((a[d+7|0]|0)!=105){break}if((a[d+8|0]|0)==114){k=-174}else{break}i=g;return k|0}else if((j|0)==112){if((a[d+1|0]|0)!=114){break}if((a[d+2|0]|0)!=111){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)!=121){break}if((a[d+7|0]|0)!=112){break}if((a[d+8|0]|0)==101){k=152}else{break}i=g;return k|0}else if((j|0)==108){if((a[d+1|0]|0)!=111){break}if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)!=97){break}if((a[d+4|0]|0)!=108){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)!=105){break}if((a[d+7|0]|0)!=109){break}if((a[d+8|0]|0)==101){k=-122}else{break}i=g;return k|0}else if((j|0)==103){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)!=101){break}if((a[d+7|0]|0)!=110){break}if((a[d+8|0]|0)==116){k=-84}else{break}i=g;return k|0}else if((j|0)==101){m=a[d+1|0]|0;if((m|0)==110){if((a[d+2|0]|0)!=100){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)!=101){break}if((a[d+7|0]|0)!=110){break}if((a[d+8|0]|0)==116){k=-52}else{break}i=g;return k|0}else if((m|0)!=118){break}if((a[d+2|0]|0)!=97){break}if((a[d+3|0]|0)!=108){break}if((a[d+4|0]|0)!=98){break}if((a[d+5|0]|0)!=121){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=101){break}if((a[d+8|0]|0)!=115){break}if(f<<24>>24!=0){k=-59;i=g;return k|0}m=c[22210]|0;n=c[((m|0)==88936?87272:m+32|0)>>2]|0;if((n&469762048|0)==201326592){k=-59;i=g;return k|0}if((n&469893120|0)!=469893120){k=0;i=g;return k|0}n=h;c[n>>2]=1952540006;c[n+4>>2]=1600483957;si(h+8|0,28232,9);k=(ej(c[m+44>>2]|0,h|0,17,0,2)|0)!=0?-59:0;i=g;return k|0}else if((j|0)==85){if((a[d+1|0]|0)!=78){break}if((a[d+2|0]|0)!=73){break}if((a[d+3|0]|0)!=84){break}if((a[d+4|0]|0)!=67){break}if((a[d+5|0]|0)!=72){break}if((a[d+6|0]|0)!=69){break}if((a[d+7|0]|0)!=67){break}if((a[d+8|0]|0)==75){k=9}else{break}i=g;return k|0}else if((j|0)==115){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}if((a[d+3|0]|0)!=110){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)!=101){break}if((a[d+7|0]|0)!=110){break}if((a[d+8|0]|0)==116){k=-189}else{break}i=g;return k|0}else if((j|0)==119){if((a[d+1|0]|0)!=97){break}if((a[d+2|0]|0)!=110){break}if((a[d+3|0]|0)!=116){break}if((a[d+4|0]|0)!=97){break}if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)!=114){break}if((a[d+7|0]|0)!=97){break}if((a[d+8|0]|0)==121){k=-248}else{break}i=g;return k|0}else{break}}else if((e|0)==10){j=a[d]|0;if((j|0)==115){m=a[d+1|0]|0;if((m|0)==111){if((a[d+2|0]|0)!=99){break}if((a[d+3|0]|0)!=107){break}if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=116){break}if((a[d+6|0]|0)!=112){break}if((a[d+7|0]|0)!=97){break}if((a[d+8|0]|0)!=105){break}if((a[d+9|0]|0)==114){k=-205}else{break}i=g;return k|0}else if((m|0)!=101){break}if((a[d+2|0]|0)!=116){break}m=a[d+3|0]|0;if((m|0)==104){if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=115){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=101){break}if((a[d+8|0]|0)!=110){break}if((a[d+9|0]|0)==116){k=-188}else{break}i=g;return k|0}else if((m|0)!=115){break}m=a[d+4|0]|0;if((m|0)==101){if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)!=118){break}if((a[d+7|0]|0)!=101){break}if((a[d+8|0]|0)!=110){break}if((a[d+9|0]|0)==116){k=-194}else{break}i=g;return k|0}else if((m|0)==111){if((a[d+5|0]|0)!=99){break}if((a[d+6|0]|0)!=107){break}if((a[d+7|0]|0)!=111){break}if((a[d+8|0]|0)!=112){break}if((a[d+9|0]|0)==116){k=-195}else{break}i=g;return k|0}else{break}}else if((j|0)==103){if((a[d+1|0]|0)!=101){break}if((a[d+2|0]|0)!=116){break}m=a[d+3|0]|0;if((m|0)==104){if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=115){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=101){break}if((a[d+8|0]|0)!=110){break}if((a[d+9|0]|0)==116){k=-80}else{break}i=g;return k|0}else if((m|0)!=115){break}m=a[d+4|0]|0;if((m|0)==111){if((a[d+5|0]|0)!=99){break}if((a[d+6|0]|0)!=107){break}if((a[d+7|0]|0)!=111){break}if((a[d+8|0]|0)!=112){break}if((a[d+9|0]|0)==116){k=-99}else{break}i=g;return k|0}else if((m|0)==101){if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)!=118){break}if((a[d+7|0]|0)!=101){break}if((a[d+8|0]|0)!=110){break}if((a[d+9|0]|0)==116){k=-97}else{break}i=g;return k|0}else{break}}else if((j|0)==101){if((a[d+1|0]|0)!=110){break}if((a[d+2|0]|0)!=100){break}j=a[d+3|0]|0;if((j|0)==115){if((a[d+4|0]|0)!=101){break}if((a[d+5|0]|0)!=114){break}if((a[d+6|0]|0)!=118){break}if((a[d+7|0]|0)!=101){break}if((a[d+8|0]|0)!=110){break}if((a[d+9|0]|0)==116){k=-55}else{break}i=g;return k|0}else if((j|0)==104){if((a[d+4|0]|0)!=111){break}if((a[d+5|0]|0)!=115){break}if((a[d+6|0]|0)!=116){break}if((a[d+7|0]|0)!=101){break}if((a[d+8|0]|0)!=110){break}if((a[d+9|0]|0)==116){k=-51}else{break}i=g;return k|0}else{break}}else{break}}}while(0);k=0;i=g;return k|0}function r9(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[18320]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=73320+(h<<2)|0;j=73320+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[18320]=e&(1<<g^-1)}else{if(l>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{b_();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[18322]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=73320+(p<<2)|0;m=73320+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[18320]=e&(1<<r^-1)}else{if(l>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{b_();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[18322]|0;if((l|0)!=0){q=c[18325]|0;d=l>>>3;l=d<<1;f=73320+(l<<2)|0;k=c[18320]|0;h=1<<d;do{if((k&h|0)==0){c[18320]=k|h;s=f;t=73320+(l+2<<2)|0}else{d=73320+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[18324]|0)>>>0){s=g;t=d;break}b_();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[18322]=m;c[18325]=e;n=i;return n|0}l=c[18321]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[73584+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[18324]|0;if(r>>>0<i>>>0){b_();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){b_();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;L26483:do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;do{if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break L26483}else{w=l;x=k;break}}else{w=g;x=q}}while(0);while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){b_();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){b_();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){b_();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{b_();return 0;return 0}}}while(0);L26505:do{if((e|0)!=0){f=d+28|0;i=73584+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[18321]=c[18321]&(1<<c[f>>2]^-1);break L26505}else{if(e>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L26505}}}while(0);if(v>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4|0)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b|0)>>2]=p;f=c[18322]|0;if((f|0)!=0){e=c[18325]|0;i=f>>>3;f=i<<1;q=73320+(f<<2)|0;k=c[18320]|0;g=1<<i;do{if((k&g|0)==0){c[18320]=k|g;y=q;z=73320+(f+2<<2)|0}else{i=73320+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[18324]|0)>>>0){y=l;z=i;break}b_();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[18322]=p;c[18325]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[18321]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=(14-(h|f|l)|0)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[73584+(A<<2)>>2]|0;L26313:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L26313}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break L26313}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[73584+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}L26328:do{if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break L26328}else{p=r;m=i;q=e}}}}while(0);if((K|0)==0){o=g;break}if(J>>>0>=((c[18322]|0)-g|0)>>>0){o=g;break}k=K;q=c[18324]|0;if(k>>>0<q>>>0){b_();return 0;return 0}m=k+g|0;p=m;if(k>>>0>=m>>>0){b_();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;L26341:do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;do{if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break L26341}else{M=B;N=j;break}}else{M=d;N=r}}while(0);while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<q>>>0){b_();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<q>>>0){b_();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){b_();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{b_();return 0;return 0}}}while(0);L26363:do{if((e|0)!=0){i=K+28|0;q=73584+(c[i>>2]<<2)|0;do{if((K|0)==(c[q>>2]|0)){c[q>>2]=L;if((L|0)!=0){break}c[18321]=c[18321]&(1<<c[i>>2]^-1);break L26363}else{if(e>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L26363}}}while(0);if(L>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=k+(e+4|0)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[k+(g|4)>>2]=J|1;c[k+(J+g|0)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;q=73320+(e<<2)|0;r=c[18320]|0;j=1<<i;do{if((r&j|0)==0){c[18320]=r|j;O=q;P=73320+(e+2<<2)|0}else{i=73320+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[18324]|0)>>>0){O=d;P=i;break}b_();return 0;return 0}}while(0);c[P>>2]=p;c[O+12>>2]=p;c[k+(g+8|0)>>2]=O;c[k+(g+12|0)>>2]=q;break}e=m;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=(14-(d|r|i)|0)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=73584+(Q<<2)|0;c[k+(g+28|0)>>2]=Q;c[k+(g+20|0)>>2]=0;c[k+(g+16|0)>>2]=0;q=c[18321]|0;l=1<<Q;if((q&l|0)==0){c[18321]=q|l;c[j>>2]=e;c[k+(g+24|0)>>2]=j;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;q=c[j>>2]|0;while(1){if((c[q+4>>2]&-8|0)==(J|0)){break}S=q+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=19691;break}else{l=l<<1;q=j}}if((T|0)==19691){if(S>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[S>>2]=e;c[k+(g+24|0)>>2]=q;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}}l=q+8|0;j=c[l>>2]|0;i=c[18324]|0;if(q>>>0<i>>>0){b_();return 0;return 0}if(j>>>0<i>>>0){b_();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[k+(g+8|0)>>2]=j;c[k+(g+12|0)>>2]=q;c[k+(g+24|0)>>2]=0;break}}}while(0);k=K+8|0;if((k|0)==0){o=g;break}else{n=k}return n|0}}while(0);K=c[18322]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[18325]|0;if(S>>>0>15){R=J;c[18325]=R+o|0;c[18322]=S;c[R+(o+4|0)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[18322]=0;c[18325]=0;c[J+4>>2]=K|3;S=J+(K+4|0)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[18323]|0;if(o>>>0<J>>>0){S=J-o|0;c[18323]=S;J=c[18326]|0;K=J;c[18326]=K+o|0;c[K+(o+4|0)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[3916]|0)==0){J=bY(8)|0;if((J-1&J|0)==0){c[3918]=J;c[3917]=J;c[3919]=-1;c[3920]=2097152;c[3921]=0;c[18431]=0;c[3916]=cl(0)&-16^1431655768;break}else{b_();return 0;return 0}}}while(0);J=o+48|0;S=c[3918]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[18430]|0;do{if((O|0)!=0){P=c[18428]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L26572:do{if((c[18431]&4|0)==0){O=c[18326]|0;L26574:do{if((O|0)==0){T=19721}else{L=O;P=73728;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=19721;break L26574}else{P=M}}if((P|0)==0){T=19721;break}L=R-(c[18323]|0)&Q;if(L>>>0>=2147483647){W=0;break}q=bN(L|0)|0;e=(q|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?q:-1;Y=e?L:0;Z=q;_=L;T=19730;break}}while(0);do{if((T|0)==19721){O=bN(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[3917]|0;q=L-1|0;if((q&g|0)==0){$=S}else{$=(S-g|0)+(q+g&-L)|0}L=c[18428]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}q=c[18430]|0;if((q|0)!=0){if(g>>>0<=L>>>0|g>>>0>q>>>0){W=0;break}}q=bN($|0)|0;g=(q|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=q;_=$;T=19730;break}}while(0);L26594:do{if((T|0)==19730){q=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=19741;break L26572}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[3918]|0;O=(K-_|0)+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bN(O|0)|0)==-1){bN(q|0);W=Y;break L26594}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=19741;break L26572}}}while(0);c[18431]=c[18431]|4;ad=W;T=19738;break}else{ad=0;T=19738}}while(0);do{if((T|0)==19738){if(S>>>0>=2147483647){break}W=bN(S|0)|0;Z=bN(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)==-1){break}else{aa=Z?ac:ad;ab=Y;T=19741;break}}}while(0);do{if((T|0)==19741){ad=(c[18428]|0)+aa|0;c[18428]=ad;if(ad>>>0>(c[18429]|0)>>>0){c[18429]=ad}ad=c[18326]|0;L26614:do{if((ad|0)==0){S=c[18324]|0;if((S|0)==0|ab>>>0<S>>>0){c[18324]=ab}c[18432]=ab;c[18433]=aa;c[18435]=0;c[18329]=c[3916]|0;c[18328]=-1;S=0;while(1){Y=S<<1;ac=73320+(Y<<2)|0;c[73320+(Y+3<<2)>>2]=ac;c[73320+(Y+2<<2)>>2]=ac;ac=S+1|0;if(ac>>>0<32){S=ac}else{break}}S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=(aa-40|0)-ae|0;c[18326]=ab+ae|0;c[18323]=S;c[ab+(ae+4|0)>>2]=S|1;c[ab+(aa-36|0)>>2]=40;c[18327]=c[3920]|0}else{S=73728;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=19753;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==19753){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa|0;ac=c[18326]|0;Y=(c[18323]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[18326]=Z+ai|0;c[18323]=W;c[Z+(ai+4|0)>>2]=W|1;c[Z+(Y+4|0)>>2]=40;c[18327]=c[3920]|0;break L26614}}while(0);if(ab>>>0<(c[18324]|0)>>>0){c[18324]=ab}S=ab+aa|0;Y=73728;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=19763;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==19763){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa|0;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8|0)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa|0)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=(S-(ab+ak|0)|0)-o|0;c[ab+(ak+4|0)>>2]=o|3;do{if((Z|0)==(c[18326]|0)){J=(c[18323]|0)+K|0;c[18323]=J;c[18326]=_;c[ab+(W+4|0)>>2]=J|1}else{if((Z|0)==(c[18325]|0)){J=(c[18322]|0)+K|0;c[18322]=J;c[18325]=_;c[ab+(W+4|0)>>2]=J|1;c[ab+(J+W|0)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al|0)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L26659:do{if(X>>>0<256){U=c[ab+((al|8)+aa|0)>>2]|0;Q=c[ab+((aa+12|0)+al|0)>>2]|0;R=73320+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}b_();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[18320]=c[18320]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}q=Q+8|0;if((c[q>>2]|0)==(Z|0)){am=q;break}b_();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;q=c[ab+((al|24)+aa|0)>>2]|0;P=c[ab+((aa+12|0)+al|0)>>2]|0;L26680:do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O|0)|0;L=c[g>>2]|0;do{if((L|0)==0){e=ab+(O+aa|0)|0;M=c[e>>2]|0;if((M|0)==0){an=0;break L26680}else{ao=M;ap=e;break}}else{ao=L;ap=g}}while(0);while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa|0)>>2]|0;if(g>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){b_();return 0;return 0}O=P+8|0;if((c[O>>2]|0)==(R|0)){c[L>>2]=P;c[O>>2]=g;an=P;break}else{b_();return 0;return 0}}}while(0);if((q|0)==0){break}P=ab+((aa+28|0)+al|0)|0;U=73584+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[18321]=c[18321]&(1<<c[P>>2]^-1);break L26659}else{if(q>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}Q=q+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[q+20>>2]=an}if((an|0)==0){break L26659}}}while(0);if(an>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}c[an+24>>2]=q;R=al|16;P=c[ab+(R+aa|0)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R|0)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa|0)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4|0)>>2]=ar|1;c[ab+(ar+W|0)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=73320+(V<<2)|0;P=c[18320]|0;q=1<<J;do{if((P&q|0)==0){c[18320]=P|q;as=X;at=73320+(V+2<<2)|0}else{J=73320+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[18324]|0)>>>0){as=U;at=J;break}b_();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8|0)>>2]=as;c[ab+(W+12|0)>>2]=X;break}V=ac;q=ar>>>8;do{if((q|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(q+1048320|0)>>>16&8;$=q<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=(14-(J|P|$)|0)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=73584+(au<<2)|0;c[ab+(W+28|0)>>2]=au;c[ab+(W+20|0)>>2]=0;c[ab+(W+16|0)>>2]=0;X=c[18321]|0;Q=1<<au;if((X&Q|0)==0){c[18321]=X|Q;c[q>>2]=V;c[ab+(W+24|0)>>2]=q;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[q>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;q=c[aw>>2]|0;if((q|0)==0){T=19836;break}else{Q=Q<<1;X=q}}if((T|0)==19836){if(aw>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[aw>>2]=V;c[ab+(W+24|0)>>2]=X;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}}Q=X+8|0;q=c[Q>>2]|0;$=c[18324]|0;if(X>>>0<$>>>0){b_();return 0;return 0}if(q>>>0<$>>>0){b_();return 0;return 0}else{c[q+12>>2]=V;c[Q>>2]=V;c[ab+(W+8|0)>>2]=q;c[ab+(W+12|0)>>2]=X;c[ab+(W+24|0)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=73728;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39|0)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+((ay-47|0)+aA|0)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=(aa-40|0)-aB|0;c[18326]=ab+aB|0;c[18323]=_;c[ab+(aB+4|0)>>2]=_|1;c[ab+(aa-36|0)>>2]=40;c[18327]=c[3920]|0;c[ac+4>>2]=27;c[W>>2]=c[18432]|0;c[W+4>>2]=c[73732>>2]|0;c[W+8>>2]=c[73736>>2]|0;c[W+12>>2]=c[73740>>2]|0;c[18432]=ab;c[18433]=aa;c[18435]=0;c[18434]=W;W=ac+28|0;c[W>>2]=7;L26778:do{if((ac+32|0)>>>0<az>>>0){_=W;while(1){K=_+4|0;c[K>>2]=7;if((_+8|0)>>>0<az>>>0){_=K}else{break L26778}}}}while(0);if((ac|0)==(Y|0)){break}W=ac-ad|0;_=Y+(W+4|0)|0;c[_>>2]=c[_>>2]&-2;c[ad+4>>2]=W|1;c[Y+W>>2]=W;_=W>>>3;if(W>>>0<256){K=_<<1;Z=73320+(K<<2)|0;S=c[18320]|0;q=1<<_;do{if((S&q|0)==0){c[18320]=S|q;aC=Z;aD=73320+(K+2<<2)|0}else{_=73320+(K+2<<2)|0;Q=c[_>>2]|0;if(Q>>>0>=(c[18324]|0)>>>0){aC=Q;aD=_;break}b_();return 0;return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;q=W>>>8;do{if((q|0)==0){aE=0}else{if(W>>>0>16777215){aE=31;break}S=(q+1048320|0)>>>16&8;Y=q<<S;ac=(Y+520192|0)>>>16&4;_=Y<<ac;Y=(_+245760|0)>>>16&2;Q=(14-(ac|S|Y)|0)+(_<<Y>>>15)|0;aE=W>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=73584+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[18321]|0;Q=1<<aE;if((Z&Q|0)==0){c[18321]=Z|Q;c[q>>2]=K;c[ad+24>>2]=q;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=W<<aF;Z=c[q>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(W|0)){break}aG=Z+16+(Q>>>31<<2)|0;q=c[aG>>2]|0;if((q|0)==0){T=19871;break}else{Q=Q<<1;Z=q}}if((T|0)==19871){if(aG>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;W=c[Q>>2]|0;q=c[18324]|0;if(Z>>>0<q>>>0){b_();return 0;return 0}if(W>>>0<q>>>0){b_();return 0;return 0}else{c[W+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=W;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[18323]|0;if(ad>>>0<=o>>>0){break}W=ad-o|0;c[18323]=W;ad=c[18326]|0;Q=ad;c[18326]=Q+o|0;c[Q+(o+4|0)>>2]=W|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[bO()>>2]=12;n=0;return n|0}function sa(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[18324]|0;if(b>>>0<e>>>0){b_()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){b_()}h=f&-8;i=a+(h-8|0)|0;j=i;L26831:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){b_()}if((n|0)==(c[18325]|0)){p=a+(h-4|0)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[18322]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4|0)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8|0)>>2]|0;s=c[a+(l+12|0)>>2]|0;t=73320+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){b_()}if((c[k+12>>2]|0)==(n|0)){break}b_()}}while(0);if((s|0)==(k|0)){c[18320]=c[18320]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){b_()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}b_()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24|0)>>2]|0;v=c[a+(l+12|0)>>2]|0;L26865:do{if((v|0)==(t|0)){w=a+(l+20|0)|0;x=c[w>>2]|0;do{if((x|0)==0){y=a+(l+16|0)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break L26865}else{B=z;C=y;break}}else{B=x;C=w}}while(0);while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){b_()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8|0)>>2]|0;if(w>>>0<e>>>0){b_()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){b_()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{b_()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28|0)|0;m=73584+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[18321]=c[18321]&(1<<c[v>>2]^-1);q=n;r=o;break L26831}else{if(p>>>0<(c[18324]|0)>>>0){b_()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L26831}}}while(0);if(A>>>0<(c[18324]|0)>>>0){b_()}c[A+24>>2]=p;t=c[a+(l+16|0)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[18324]|0)>>>0){b_()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20|0)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[18324]|0)>>>0){b_()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){b_()}A=a+(h-4|0)|0;e=c[A>>2]|0;if((e&1|0)==0){b_()}do{if((e&2|0)==0){if((j|0)==(c[18326]|0)){B=(c[18323]|0)+r|0;c[18323]=B;c[18326]=q;c[q+4>>2]=B|1;if((q|0)==(c[18325]|0)){c[18325]=0;c[18322]=0}if(B>>>0<=(c[18327]|0)>>>0){return}sd(0);return}if((j|0)==(c[18325]|0)){B=(c[18322]|0)+r|0;c[18322]=B;c[18325]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L26936:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=73320+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[18324]|0)>>>0){b_()}if((c[u+12>>2]|0)==(j|0)){break}b_()}}while(0);if((g|0)==(u|0)){c[18320]=c[18320]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[18324]|0)>>>0){b_()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}b_()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16|0)>>2]|0;t=c[a+(h|4)>>2]|0;L26938:do{if((t|0)==(b|0)){p=a+(h+12|0)|0;v=c[p>>2]|0;do{if((v|0)==0){m=a+(h+8|0)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break L26938}else{F=k;G=m;break}}else{F=v;G=p}}while(0);while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[18324]|0)>>>0){b_()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[18324]|0)>>>0){b_()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){b_()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{b_()}}}while(0);if((f|0)==0){break}t=a+(h+20|0)|0;u=73584+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[18321]=c[18321]&(1<<c[t>>2]^-1);break L26936}else{if(f>>>0<(c[18324]|0)>>>0){b_()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L26936}}}while(0);if(E>>>0<(c[18324]|0)>>>0){b_()}c[E+24>>2]=f;b=c[a+(h+8|0)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[18324]|0)>>>0){b_()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12|0)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[18324]|0)>>>0){b_()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[18325]|0)){H=B;break}c[18322]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=73320+(d<<2)|0;A=c[18320]|0;E=1<<r;do{if((A&E|0)==0){c[18320]=A|E;I=e;J=73320+(d+2<<2)|0}else{r=73320+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[18324]|0)>>>0){I=h;J=r;break}b_()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=(14-(E|J|d)|0)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=73584+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[18321]|0;d=1<<K;do{if((r&d|0)==0){c[18321]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=20050;break}else{A=A<<1;J=E}}if((N|0)==20050){if(M>>>0<(c[18324]|0)>>>0){b_()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[18324]|0;if(J>>>0<E>>>0){b_()}if(B>>>0<E>>>0){b_()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[18328]|0)-1|0;c[18328]=q;if((q|0)==0){O=73736}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[18328]=-1;return}function sb(a,b){a=a|0;b=b|0;var d=0,e=0;do{if((a|0)==0){d=0}else{e=aa(b,a);if((b|a)>>>0<=65535){d=e;break}d=((e>>>0)/(a>>>0)>>>0|0)==(b|0)?e:-1}}while(0);b=r9(d)|0;if((b|0)==0){return b|0}if((c[b-4>>2]&3|0)==0){return b|0}sh(b|0,0,d|0);return b|0}function sc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=r9(b)|0;return d|0}if(b>>>0>4294967231){c[bO()>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=se(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=r9(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;si(f|0,a|0,g>>>0<b>>>0?g:b);sa(a);d=f;return d|0}function sd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[3916]|0)==0){b=bY(8)|0;if((b-1&b|0)==0){c[3918]=b;c[3917]=b;c[3919]=-1;c[3920]=2097152;c[3921]=0;c[18431]=0;c[3916]=cl(0)&-16^1431655768;break}else{b_();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[18326]|0;if((b|0)==0){d=0;return d|0}e=c[18323]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[3918]|0;g=aa(((((((-40-a|0)-1|0)+e|0)+f|0)>>>0)/(f>>>0)>>>0)-1|0,f);h=b;i=73728;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bN(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bN(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bN(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j|0;c[18428]=(c[18428]|0)-j|0;h=c[18326]|0;m=(c[18323]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[18326]=j+o|0;c[18323]=n;c[j+(o+4|0)>>2]=n|1;c[j+(m+4|0)>>2]=40;c[18327]=c[3920]|0;d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[18323]|0)>>>0<=(c[18327]|0)>>>0){d=0;return d|0}c[18327]=-1;d=0;return d|0}function se(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[18324]|0;if(g>>>0<j>>>0){b_();return 0;return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){b_();return 0;return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){b_();return 0;return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[3918]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=k|3;c[l>>2]=c[l>>2]|1;sf(g+b|0,k);n=a;return n|0}if((i|0)==(c[18326]|0)){k=(c[18323]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=l|1;c[18326]=g+b|0;c[18323]=l;n=a;return n|0}if((i|0)==(c[18325]|0)){l=(c[18322]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4|0)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4|0)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[18322]=q;c[18325]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L27169:do{if(m>>>0<256){l=c[g+(f+8|0)>>2]|0;k=c[g+(f+12|0)>>2]|0;o=73320+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){b_();return 0;return 0}if((c[l+12>>2]|0)==(i|0)){break}b_();return 0;return 0}}while(0);if((k|0)==(l|0)){c[18320]=c[18320]&(1<<e^-1);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){b_();return 0;return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}b_();return 0;return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24|0)>>2]|0;t=c[g+(f+12|0)>>2]|0;L27171:do{if((t|0)==(o|0)){u=g+(f+20|0)|0;v=c[u>>2]|0;do{if((v|0)==0){w=g+(f+16|0)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break L27171}else{z=x;A=w;break}}else{z=v;A=u}}while(0);while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){b_();return 0;return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8|0)>>2]|0;if(u>>>0<j>>>0){b_();return 0;return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){b_();return 0;return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{b_();return 0;return 0}}}while(0);if((s|0)==0){break}t=g+(f+28|0)|0;l=73584+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[18321]=c[18321]&(1<<c[t>>2]^-1);break L27169}else{if(s>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L27169}}}while(0);if(y>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}c[y+24>>2]=s;o=c[g+(f+16|0)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20|0)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[18324]|0)>>>0){b_();return 0;return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4|0)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;sf(g+b|0,q);n=a;return n|0}return 0}function sf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L27245:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[18324]|0;if(i>>>0<l>>>0){b_()}if((j|0)==(c[18325]|0)){m=d+(b+4|0)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[18322]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h|0)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h|0)>>2]|0;q=c[d+(12-h|0)>>2]|0;r=73320+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){b_()}if((c[p+12>>2]|0)==(j|0)){break}b_()}}while(0);if((q|0)==(p|0)){c[18320]=c[18320]&(1<<m^-1);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){b_()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}b_()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h|0)>>2]|0;t=c[d+(12-h|0)>>2]|0;L27279:do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4|0)|0;w=c[v>>2]|0;do{if((w|0)==0){x=d+u|0;y=c[x>>2]|0;if((y|0)==0){z=0;break L27279}else{A=y;B=x;break}}else{A=w;B=v}}while(0);while(1){v=A+20|0;w=c[v>>2]|0;if((w|0)!=0){A=w;B=v;continue}v=A+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{A=w;B=v}}if(B>>>0<l>>>0){b_()}else{c[B>>2]=0;z=A;break}}else{v=c[d+(8-h|0)>>2]|0;if(v>>>0<l>>>0){b_()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){b_()}u=t+8|0;if((c[u>>2]|0)==(r|0)){c[w>>2]=t;c[u>>2]=v;z=t;break}else{b_()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h|0)|0;l=73584+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=z;if((z|0)!=0){break}c[18321]=c[18321]&(1<<c[t>>2]^-1);n=j;o=k;break L27245}else{if(m>>>0<(c[18324]|0)>>>0){b_()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=z}else{c[m+20>>2]=z}if((z|0)==0){n=j;o=k;break L27245}}}while(0);if(z>>>0<(c[18324]|0)>>>0){b_()}c[z+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[18324]|0)>>>0){b_()}else{c[z+16>>2]=t;c[t+24>>2]=z;break}}}while(0);t=c[d+(r+4|0)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[18324]|0)>>>0){b_()}else{c[z+20>>2]=t;c[t+24>>2]=z;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[18324]|0;if(e>>>0<a>>>0){b_()}z=d+(b+4|0)|0;A=c[z>>2]|0;do{if((A&2|0)==0){if((f|0)==(c[18326]|0)){B=(c[18323]|0)+o|0;c[18323]=B;c[18326]=n;c[n+4>>2]=B|1;if((n|0)!=(c[18325]|0)){return}c[18325]=0;c[18322]=0;return}if((f|0)==(c[18325]|0)){B=(c[18322]|0)+o|0;c[18322]=B;c[18325]=n;c[n+4>>2]=B|1;c[n+B>>2]=B;return}B=(A&-8)+o|0;s=A>>>3;L27345:do{if(A>>>0<256){g=c[d+(b+8|0)>>2]|0;t=c[d+(b+12|0)>>2]|0;h=73320+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){b_()}if((c[g+12>>2]|0)==(f|0)){break}b_()}}while(0);if((t|0)==(g|0)){c[18320]=c[18320]&(1<<s^-1);break}do{if((t|0)==(h|0)){C=t+8|0}else{if(t>>>0<a>>>0){b_()}m=t+8|0;if((c[m>>2]|0)==(f|0)){C=m;break}b_()}}while(0);c[g+12>>2]=t;c[C>>2]=g}else{h=e;m=c[d+(b+24|0)>>2]|0;l=c[d+(b+12|0)>>2]|0;L27347:do{if((l|0)==(h|0)){i=d+(b+20|0)|0;p=c[i>>2]|0;do{if((p|0)==0){q=d+(b+16|0)|0;v=c[q>>2]|0;if((v|0)==0){D=0;break L27347}else{E=v;F=q;break}}else{E=p;F=i}}while(0);while(1){i=E+20|0;p=c[i>>2]|0;if((p|0)!=0){E=p;F=i;continue}i=E+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{E=p;F=i}}if(F>>>0<a>>>0){b_()}else{c[F>>2]=0;D=E;break}}else{i=c[d+(b+8|0)>>2]|0;if(i>>>0<a>>>0){b_()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){b_()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;D=l;break}else{b_()}}}while(0);if((m|0)==0){break}l=d+(b+28|0)|0;g=73584+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=D;if((D|0)!=0){break}c[18321]=c[18321]&(1<<c[l>>2]^-1);break L27345}else{if(m>>>0<(c[18324]|0)>>>0){b_()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=D}else{c[m+20>>2]=D}if((D|0)==0){break L27345}}}while(0);if(D>>>0<(c[18324]|0)>>>0){b_()}c[D+24>>2]=m;h=c[d+(b+16|0)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[18324]|0)>>>0){b_()}else{c[D+16>>2]=h;c[h+24>>2]=D;break}}}while(0);h=c[d+(b+20|0)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[18324]|0)>>>0){b_()}else{c[D+20>>2]=h;c[h+24>>2]=D;break}}}while(0);c[n+4>>2]=B|1;c[n+B>>2]=B;if((n|0)!=(c[18325]|0)){G=B;break}c[18322]=B;return}else{c[z>>2]=A&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;G=o}}while(0);o=G>>>3;if(G>>>0<256){A=o<<1;z=73320+(A<<2)|0;D=c[18320]|0;b=1<<o;do{if((D&b|0)==0){c[18320]=D|b;H=z;I=73320+(A+2<<2)|0}else{o=73320+(A+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[18324]|0)>>>0){H=d;I=o;break}b_()}}while(0);c[I>>2]=n;c[H+12>>2]=n;c[n+8>>2]=H;c[n+12>>2]=z;return}z=n;H=G>>>8;do{if((H|0)==0){J=0}else{if(G>>>0>16777215){J=31;break}I=(H+1048320|0)>>>16&8;A=H<<I;b=(A+520192|0)>>>16&4;D=A<<b;A=(D+245760|0)>>>16&2;o=(14-(b|I|A)|0)+(D<<A>>>15)|0;J=G>>>((o+7|0)>>>0)&1|o<<1}}while(0);H=73584+(J<<2)|0;c[n+28>>2]=J;c[n+20>>2]=0;c[n+16>>2]=0;o=c[18321]|0;A=1<<J;if((o&A|0)==0){c[18321]=o|A;c[H>>2]=z;c[n+24>>2]=H;c[n+12>>2]=n;c[n+8>>2]=n;return}if((J|0)==31){K=0}else{K=25-(J>>>1)|0}J=G<<K;K=c[H>>2]|0;while(1){if((c[K+4>>2]&-8|0)==(G|0)){break}L=K+16+(J>>>31<<2)|0;H=c[L>>2]|0;if((H|0)==0){M=20366;break}else{J=J<<1;K=H}}if((M|0)==20366){if(L>>>0<(c[18324]|0)>>>0){b_()}c[L>>2]=z;c[n+24>>2]=K;c[n+12>>2]=n;c[n+8>>2]=n;return}L=K+8|0;M=c[L>>2]|0;J=c[18324]|0;if(K>>>0<J>>>0){b_()}if(M>>>0<J>>>0){b_()}c[M+12>>2]=z;c[L>>2]=z;c[n+8>>2]=M;c[n+12>>2]=K;c[n+24>>2]=0;return}function sg(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function sh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function si(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2]|0;b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function sj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;t=t+1|0;c[a>>2]=t;while((e|0)<40){if((c[d+e*4>>2]|0)==0){c[d+e*4>>2]=t;c[d+(e*4+4)>>2]=b;c[d+(e*4+8)>>2]=0;return 0}e=e+2|0}bi(116);bi(111);bi(111);bi(32);bi(109);bi(97);bi(110);bi(121);bi(32);bi(115);bi(101);bi(116);bi(106);bi(109);bi(112);bi(115);bi(32);bi(105);bi(110);bi(32);bi(97);bi(32);bi(102);bi(117);bi(110);bi(99);bi(116);bi(105);bi(111);bi(110);bi(32);bi(99);bi(97);bi(108);bi(108);bi(44);bi(32);bi(98);bi(117);bi(105);bi(108);bi(100);bi(32);bi(119);bi(105);bi(116);bi(104);bi(32);bi(97);bi(32);bi(104);bi(105);bi(103);bi(104);bi(101);bi(114);bi(32);bi(118);bi(97);bi(108);bi(117);bi(101);bi(32);bi(102);bi(111);bi(114);bi(32);bi(77);bi(65);bi(88);bi(95);bi(83);bi(69);bi(84);bi(74);bi(77);bi(80);bi(83);bi(10);ab(0);return 0}function sk(a,b){a=a|0;b=b|0;var d=0,e=0;while((d|0)<20){e=c[b+d*4>>2]|0;if((e|0)==0)break;if((e|0)==(a|0)){return c[b+(d*4+4)>>2]|0}d=d+2|0}return 0}function sl(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function sm(a){a=a|0;a7(a|0)}function sn(a){a=a|0;return aQ(a|0)|0}function so(a){a=a|0;return bP(a|0)|0}function sp(a){a=a|0;return bJ(a|0)|0}function sq(a){a=a|0;return bI(a|0)|0}function sr(a){a=a|0;return aB(a|0)|0}function ss(a){a=a|0;return cl(a|0)|0}function st(a){a=a|0;return bL(a|0)|0}function su(a,b){a=a|0;b=b|0;return bA(a|0,b|0)|0}function sv(a,b){a=a|0;b=b|0;return bu(a|0,b|0)|0}function sw(a,b){a=a|0;b=b|0;return bQ(a|0,b|0)|0}function sx(a,b){a=a|0;b=b|0;return aC(a|0,b|0)|0}function sy(a,b){a=a|0;b=b|0;return bU(a|0,b|0)|0}function sz(a,b){a=a|0;b=b|0;return aX(a|0,b|0)|0}function sA(){return a3()|0}function sB(){return bO()|0}function sC(a,b,c){a=a|0;b=b|0;c=c|0;return aY(a|0,b|0,c|0)|0}function sD(a,b,c){a=a|0;b=b|0;c=c|0;return bn(a|0,b|0,c|0)|0}function sE(a,b,c){a=a|0;b=b|0;c=c|0;return b9(a|0,b|0,c|0)|0}function sF(a,b,c){a=a|0;b=b|0;c=c|0;return b$(a|0,b|0,c|0)|0}function sG(a,b){a=a|0;b=b|0;cc(a|0,b|0)}function sH(a){a=+a;return+T(+a)}function sI(a){a=+a;return+Z(+a)}function sJ(a){a=+a;return+_(+a)}function sK(a){a=+a;return+S(+a)}function sL(a){a=+a;return+Q(+a)}function sM(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return aH(a|0,b|0,c|0,d|0)|0}function sN(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cm[a&2047](b|0,c|0,d|0)|0}function sO(a){a=a|0;return cn[a&2047]()|0}function sP(a,b){a=a|0;b=b|0;co[a&2047](b|0)}function sQ(a,b,c,d,e,f,g,h,i,j,k){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;return cp[a&2047](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0,k|0)|0}function sR(a,b,c){a=a|0;b=b|0;c=c|0;cq[a&2047](b|0,c|0)}function sS(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;return cr[a&2047](b|0,c|0,d|0,e|0,f|0,g|0)|0}function sT(a,b){a=a|0;b=b|0;return cs[a&2047](b|0)|0}function sU(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ct[a&2047](b|0,c|0,d|0)}function sV(a,b){a=a|0;b=+b;return+cu[a&2047](+b)}function sW(a){a=a|0;cv[a&2047]()}function sX(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return cw[a&2047](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function sY(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return cx[a&2047](b|0,c|0,d|0,e|0)|0}function sZ(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;return cy[a&2047](b|0,c|0,d|0,e|0,f|0,g|0,h|0)|0}function s_(a,b,c){a=a|0;b=b|0;c=c|0;return cz[a&2047](b|0,c|0)|0}function s$(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return cA[a&2047](b|0,c|0,d|0,e|0,f|0)|0}function s0(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;cB[a&2047](b|0,c|0,d|0,e|0)}function s1(a,b,c){a=a|0;b=b|0;c=c|0;ab(0);return 0}function s2(){ab(1);return 0}function s3(a){a=a|0;ab(2)}function s4(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;ab(3);return 0}function s5(a,b){a=a|0;b=b|0;ab(4)}function s6(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ab(5);return 0}function s7(a){a=a|0;ab(6);return 0}function s8(a,b,c){a=a|0;b=b|0;c=c|0;ab(7)}function s9(a){a=+a;ab(8);return 0.0}function ta(){ab(9)}function tb(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ab(10);return 0}function tc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ab(11);return 0}function td(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ab(12);return 0}function te(a,b){a=a|0;b=b|0;ab(13);return 0}function tf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ab(14);return 0}function tg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ab(15)}
// EMSCRIPTEN_END_FUNCS
var cm=[s1,s1,s1,s1,s1,s1,s1,s1,sC,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,rr,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,ow,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,qc,s1,hX,s1,s1,s1,sD,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,fL,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,sE,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,pn,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,m7,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,rs,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,sF,s1,s1,s1,s1,s1,s1,s1,s1,s1,g9,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,ds,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,qe,s1,s1,s1,s1,s1,s1,s1,s1,s1,m5,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,rq,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,ph,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,km,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,ha,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1,s1];var cn=[s2,s2,li,s2,iA,s2,s2,s2,s2,s2,jI,s2,l3,s2,iD,s2,s2,s2,lk,s2,jj,s2,iE,s2,ij,s2,s2,s2,s2,s2,lU,s2,h9,s2,s2,s2,j6,s2,is,s2,kL,s2,s2,s2,jK,s2,s2,s2,iZ,s2,ii,s2,h8,s2,s2,s2,lN,s2,jG,s2,k0,s2,lc,s2,s2,s2,lW,s2,s2,s2,jS,s2,l5,s2,kO,s2,s2,s2,s2,s2,s2,s2,ml,s2,s2,s2,s2,s2,jZ,s2,mz,s2,s2,s2,s2,s2,s2,s2,kK,s2,i1,s2,s2,s2,lm,s2,s2,s2,it,s2,s2,s2,jv,s2,iH,s2,ji,s2,kY,s2,s2,s2,jL,s2,mh,s2,ms,s2,k1,s2,lf,s2,lF,s2,s2,s2,s2,s2,iy,s2,s2,s2,s2,s2,lZ,s2,s2,s2,jf,s2,s2,s2,s2,s2,i9,s2,k9,s2,jy,s2,ig,s2,s2,s2,lK,s2,s2,s2,s2,s2,jc,s2,kf,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,iC,s2,lg,s2,s2,s2,s2,s2,s2,s2,s2,s2,mt,s2,my,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,ik,s2,s2,s2,s2,s2,sA,s2,s2,s2,s2,s2,s2,s2,s2,s2,kP,s2,ix,s2,kk,s2,s2,s2,jk,s2,ih,s2,me,s2,jz,s2,s2,s2,s2,s2,mc,s2,s2,s2,lT,s2,s2,s2,lH,s2,s2,s2,k4,s2,k8,s2,s2,s2,lC,s2,jN,s2,s2,s2,j7,s2,lb,s2,jE,s2,jt,s2,s2,s2,s2,s2,jm,s2,mq,s2,k2,s2,s2,s2,s2,s2,s2,s2,kv,s2,jx,s2,j4,s2,s2,s2,ib,s2,s2,s2,jn,s2,mu,s2,s2,s2,s2,s2,iK,s2,iw,s2,h7,s2,s2,s2,i3,s2,s2,s2,kR,s2,kq,s2,s2,s2,kF,s2,s2,s2,lM,s2,s2,s2,iR,s2,lu,s2,s2,s2,s2,s2,jB,s2,mj,s2,jp,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,mA,s2,jU,s2,ju,s2,s2,s2,i4,s2,mB,s2,jh,s2,s2,s2,s2,s2,s2,s2,i0,s2,h3,s2,s2,s2,s2,s2,id,s2,k3,s2,s2,s2,iP,s2,s2,s2,s2,s2,h2,s2,s2,s2,s2,s2,s2,s2,lv,s2,s2,s2,lY,s2,mO,s2,h1,s2,kp,s2,jA,s2,s2,s2,jM,s2,s2,s2,lo,s2,s2,s2,lO,s2,kB,s2,la,s2,s2,s2,mr,s2,kw,s2,s2,s2,kQ,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,lt,s2,iX,s2,i$,s2,s2,s2,s2,s2,s2,s2,iF,s2,iV,s2,s2,s2,kC,s2,kM,s2,s2,s2,i5,s2,s2,s2,mv,s2,iW,s2,iv,s2,iY,s2,sB,s2,s2,s2,lh,s2,s2,s2,s2,s2,j$,s2,iu,s2,s2,s2,s2,s2,s2,s2,s2,s2,jV,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,kd,s2,j0,s2,s2,s2,jo,s2,iI,s2,lE,s2,lP,s2,s2,s2,iG,s2,iS,s2,jD,s2,s2,s2,mn,s2,k$,s2,s2,s2,s2,s2,s2,s2,mg,s2,s2,s2,s2,s2,s2,s2,mE,s2,mi,s2,iJ,s2,iM,s2,s2,s2,s2,s2,s2,s2,s2,s2,lz,s2,s2,s2,s2,s2,jr,s2,l0,s2,kn,s2,kV,s2,s2,s2,kT,s2,l$,s2,s2,s2,kW,s2,jw,s2,ir,s2,iU,s2,iz,s2,j2,s2,ke,s2,s2,s2,s2,s2,md,s2,jF,s2,s2,s2,s2,s2,jO,s2,lr,s2,s2,s2,kZ,s2,s2,s2,lp,s2,s2,s2,s2,s2,lL,s2,s2,s2,js,s2,jq,s2,l6,s2,s2,s2,s2,s2,jH,s2,k_,s2,s2,s2,s2,s2,s2,s2,mk,s2,s2,s2,s2,s2,s2,s2,s2,s2,j9,s2,s2,s2,lD,s2,jQ,s2,s2,s2,s2,s2,s2,s2,mw,s2,s2,s2,s2,s2,s2,s2,k7,s2,iO,s2,mG,s2,s2,s2,s2,s2,je,s2,j5,s2,h4,s2,s2,s2,s2,s2,s2,s2,s2,s2,kG,s2,nW,s2,l8,s2,om,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,ja,s2,lj,s2,jR,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,mo,s2,s2,s2,s2,s2,lq,s2,lX,s2,mp,s2,s2,s2,s2,s2,s2,s2,lG,s2,kH,s2,s2,s2,s2,s2,jd,s2,kD,s2,kt,s2,s2,s2,ls,s2,s2,s2,s2,s2,s2,s2,jb,s2,s2,s2,s2,s2,s2,s2,ma,s2,i_,s2,s2,s2,im,s2,jl,s2,s2,s2,hC,s2,kX,s2,s2,s2,lJ,s2,lw,s2,s2,s2,s2,s2,s2,s2,s2,s2,ia,s2,lV,s2,l_,s2,iQ,s2,i7,s2,i8,s2,s2,s2,s2,s2,s2,s2,ka,s2,iL,s2,kA,s2,s2,s2,ic,s2,mf,s2,lA,s2,s2,s2,s2,s2,kN,s2,s2,s2,s2,s2,r4,s2,l2,s2,ip,s2,iN,s2,s2,s2,s2,s2,s2,s2,l4,s2,s2,s2,s2,s2,l7,s2,k5,s2,s2,s2,s2,s2,s2,s2,ku,s2,s2,s2,lI,s2,lS,s2,s2,s2,s2,s2,j_,s2,s2,s2,s2,s2,i2,s2,kI,s2,s2,s2,k6,s2,ld,s2,kh,s2,s2,s2,s2,s2,s2,s2,s2,s2,ly,s2,s2,s2,s2,s2,s2,s2,l9,s2,s2,s2,s2,s2,s2,s2,s2,s2,ln,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,jC,s2,mb,s2,s2,s2,iq,s2,s2,s2,dn,s2,s2,s2,s2,s2,s2,s2,s2,s2,jT,s2,s2,s2,s2,s2,s2,s2,kx,s2,s2,s2,il,s2,s2,s2,j1,s2,s2,s2,kz,s2,jg,s2,iT,s2,mx,s2,s2,s2,s2,s2,s2,s2,lR,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2,s2];var co=[s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qq,s3,s3,s3,s3,s3,qM,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qK,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qB,s3,s3,s3,s3,s3,s3,s3,s3,s3,qV,s3,s3,s3,s3,s3,qr,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qU,s3,lx,s3,s3,s3,s3,s3,s3,s3,qT,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qy,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,h0,s3,qo,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,dI,s3,qQ,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,ol,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qF,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,fx,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qJ,s3,qG,s3,s3,s3,s3,s3,s3,s3,s3,s3,r_,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,sa,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,en,s3,s3,s3,n_,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qp,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,m2,s3,s3,s3,s3,s3,nR,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,gt,s3,qE,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qt,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qD,s3,qS,s3,s3,s3,s3,s3,s3,s3,s3,s3,qI,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,hW,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qz,s3,qN,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qw,s3,s3,s3,s3,s3,s3,s3,qR,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,eu,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,oc,s3,hj,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qH,s3,s3,s3,s3,s3,nb,s3,s3,s3,s3,s3,s3,s3,qO,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,ey,s3,s3,s3,s3,s3,s3,s3,qs,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,h_,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,nN,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,o6,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qP,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,qu,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,dS,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,sm,s3,qL,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,fp,s3,s3,s3,s3,s3,s3,s3,qx,s3,s3,s3,s3,s3,qC,s3,s3,s3,s3,s3,qv,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,hi,s3,s3,s3,s3,s3,s3,s3,s3,s3,qA,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3,s3];var cp=[s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,nc,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4,s4];var cq=[s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,oS,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,hF,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,cY,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,hH,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,oY,s5,s5,s5,cR,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,op,s5,ro,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,rn,s5,s5,s5,sG,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,pE,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,cZ,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,eG,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5,s5];var cr=[s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,nJ,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6,s6];var cs=[s7,s7,s7,s7,s7,s7,gP,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,m1,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gB,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gM,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gZ,s7,s7,s7,o8,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,r9,s7,s7,s7,s7,s7,s7,s7,s7,s7,rk,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,ru,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,sn,s7,s7,s7,s7,s7,s7,s7,gQ,s7,s7,s7,gy,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,g_,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,ks,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,g3,s7,s7,s7,s7,s7,s7,s7,s7,s7,gI,s7,s7,s7,gW,s7,s7,s7,s7,s7,g2,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,ez,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gC,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,c0,s7,s7,s7,m8,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gU,s7,s7,s7,s7,s7,gT,s7,g5,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,g0,s7,f9,s7,s7,s7,s7,s7,s7,s7,fr,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,so,s7,s7,s7,hg,s7,s7,s7,gN,s7,sg,s7,s7,s7,s7,s7,s7,s7,gV,s7,s7,s7,hd,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,g6,s7,gK,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,g8,s7,s7,s7,gO,s7,s7,s7,s7,s7,s7,s7,oE,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,eB,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gJ,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,he,s7,sp,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,sq,s7,sr,s7,s7,s7,gD,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gX,s7,s7,s7,s7,s7,s7,s7,s7,s7,gL,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,h$,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,ho,s7,s7,s7,hf,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,g$,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gA,s7,fF,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gG,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,hc,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,g4,s7,ss,s7,s7,s7,gR,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,hP,s7,s7,s7,s7,s7,s7,s7,gE,s7,s7,s7,s7,s7,s7,s7,s7,s7,r$,s7,s7,s7,st,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gY,s7,fA,s7,s7,s7,s7,s7,s7,s7,hh,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,gH,s7,gS,s7,s7,s7,gF,s7,s7,s7,s7,s7,s7,s7,g1,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7,s7];var ct=[s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,m4,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,pG,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,hU,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,px,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,hY,s8,s8,s8,m3,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,n4,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,rM,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,hR,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,oH,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,rJ,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8,s8];var cu=[s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,sH,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,sI,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,sJ,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,sK,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,sL,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9,s9];var cv=[ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,n3,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,hS,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,kr,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,oj,ta,ta,ta,on,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,qW,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,hL,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,nZ,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta,ta];var cw=[tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,dT,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,nI,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb,tb];var cx=[tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,na,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,dE,tc,sM,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,m6,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,rR,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc,tc];var cy=[td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,gx,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td,td];var cz=[te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,fn,te,te,te,te,te,te,te,te,te,or,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,eK,te,te,te,eM,te,te,te,te,te,te,te,m0,te,te,te,te,te,te,te,te,te,pg,te,te,te,te,te,te,te,te,te,te,te,te,te,eV,te,mW,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,e7,te,eW,te,te,te,te,te,te,te,te,te,m$,te,te,te,te,te,fk,te,te,te,te,te,te,te,te,te,eY,te,te,te,e4,te,te,te,te,te,te,te,te,te,te,te,rl,te,te,te,dr,te,te,te,te,te,te,te,su,te,te,te,te,te,eN,te,te,te,te,te,te,te,fe,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,sv,te,te,te,te,te,te,te,eS,te,te,te,te,te,te,te,te,te,eZ,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,po,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,q4,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,sw,te,te,te,te,te,fh,te,te,te,te,te,te,te,te,te,te,te,te,te,mT,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,mV,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,fq,te,te,te,te,te,te,te,sx,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,ff,te,te,te,te,te,te,te,mY,te,te,te,te,te,te,te,te,te,e$,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,sy,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,hJ,te,te,te,te,te,sz,te,te,te,te,te,te,te,fg,te,te,te,te,te,te,te,te,te,e1,te,te,te,te,te,te,te,te,te,pM,te,te,te,te,te,te,te,te,te,te,te,dL,te,eT,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,mX,te,te,te,te,te,te,te,te,te,te,te,te,te,e8,te,te,te,te,te,te,te,te,te,te,te,fc,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,fl,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,mU,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,eJ,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,eI,te,te,te,te,te,e3,te,te,te,te,te,te,te,hm,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,fa,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,m_,te,te,te,fs,te,te,te,te,te,te,te,te,te,te,te,ev,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,eU,te,te,te,te,te,te,te,eQ,te,te,te,te,te,te,te,mP,te,te,te,te,te,te,te,te,te,te,te,pk,te,te,te,te,te,te,te,te,te,te,te,te,te,e9,te,te,te,te,te,te,te,rv,te,te,te,te,te,te,te,e0,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,mR,te,ft,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,e6,te,te,te,te,te,e5,te,mS,te,te,te,te,te,te,te,te,te,te,te,te,te,eL,te,te,te,te,te,te,te,te,te,te,te,eR,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,mQ,te,te,te,te,te,te,te,te,te,te,te,te,te,fo,te,te,te,te,te,te,te,te,te,ry,te,te,te,te,te,te,te,eP,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,fi,te,te,te,te,te,te,te,te,te,te,te,rm,te,te,te,te,te,sb,te,fd,te,te,te,te,te,te,te,te,te,eD,te,te,te,te,te,te,te,te,te,te,te,sc,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,fm,te,pe,te,te,te,te,te,te,te,fb,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te,te];var cA=[tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf,tf];var cB=[tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,ea,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,eb,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,nd,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,oW,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg,tg];return{_testSetjmp:sk,_saveSetjmp:sj,_tolower:sl,_free:sa,_main:fv,_perl_eval:fu,_realloc:sc,_memset:sh,_malloc:r9,_memcpy:si,_strlen:sg,_calloc:sb,stackAlloc:cC,stackSave:cD,stackRestore:cE,setThrew:cF,setTempRet0:cG,setTempRet1:cH,setTempRet2:cI,setTempRet3:cJ,setTempRet4:cK,setTempRet5:cL,setTempRet6:cM,setTempRet7:cN,setTempRet8:cO,setTempRet9:cP,dynCall_iiii:sN,dynCall_i:sO,dynCall_vi:sP,dynCall_iiiiiiiiiii:sQ,dynCall_vii:sR,dynCall_iiiiiii:sS,dynCall_ii:sT,dynCall_viii:sU,dynCall_ff:sV,dynCall_v:sW,dynCall_iiiiiiiii:sX,dynCall_iiiii:sY,dynCall_iiiiiiii:sZ,dynCall_iii:s_,dynCall_iiiiii:s$,dynCall_viiii:s0}})
// EMSCRIPTEN_END_ASM
({ Math: Math, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array, Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Float32Array: Float32Array, Float64Array: Float64Array }, { abort: abort, assert: assert, asmPrintInt: asmPrintInt, asmPrintFloat: asmPrintFloat, copyTempDouble: copyTempDouble, copyTempFloat: copyTempFloat, min: Math_min, invoke_iiii: invoke_iiii, invoke_i: invoke_i, invoke_vi: invoke_vi, invoke_iiiiiiiiiii: invoke_iiiiiiiiiii, invoke_vii: invoke_vii, invoke_iiiiiii: invoke_iiiiiii, invoke_ii: invoke_ii, invoke_viii: invoke_viii, invoke_ff: invoke_ff, invoke_v: invoke_v, invoke_iiiiiiiii: invoke_iiiiiiiii, invoke_iiiii: invoke_iiiii, invoke_iiiiiiii: invoke_iiiiiiii, invoke_iii: invoke_iii, invoke_iiiiii: invoke_iiiiii, invoke_viiii: invoke_viiii, _llvm_lifetime_end: _llvm_lifetime_end, _lseek: _lseek, _rand: _rand, _fclose: _fclose, _kill: _kill, _strtoul: _strtoul, _fflush: _fflush, _strtol: _strtol, _fputc: _fputc, _fwrite: _fwrite, _umask: _umask, _setgid: _setgid, _tmpnam: _tmpnam, _isspace: _isspace, _localtime: _localtime, _read: _read, _ceil: _ceil, _execl: _execl, _fileno: _fileno, _strstr: _strstr, _fsync: _fsync, _opendir: _opendir, _freopen: _freopen, _sleep: _sleep, _div: _div, _strcmp: _strcmp, _memchr: _memchr, _llvm_va_end: _llvm_va_end, _tmpfile: _tmpfile, _snprintf: _snprintf, _fgetc: _fgetc, _readdir: _readdir, _close: _close, _getgid: _getgid, _strchr: _strchr, ___setErrNo: ___setErrNo, _ftell: _ftell, _exit: _exit, _sprintf: _sprintf, _strrchr: _strrchr, _fcntl: _fcntl, _fmod: _fmod, _strcspn: _strcspn, _ferror: _ferror, _llvm_uadd_with_overflow_i32: _llvm_uadd_with_overflow_i32, _localtime_r: _localtime_r, _wait: _wait, _cos: _cos, _putchar: _putchar, _putenv: _putenv, _islower: _islower, __exit: __exit, _isupper: _isupper, _strncmp: _strncmp, _tzset: _tzset, _chmod: _chmod, _isprint: _isprint, _toupper: _toupper, _printf: _printf, _pread: _pread, _fopen: _fopen, _open: _open, _usleep: _usleep, _frexp: _frexp, _log: _log, _isalnum: _isalnum, _fdopen: _fdopen, _qsort: _qsort, _isalpha: _isalpha, _dup: _dup, _fork: _fork, _srand: _srand, _isatty: _isatty, __formatString: __formatString, _getenv: _getenv, _atoi: _atoi, _llvm_bswap_i16: _llvm_bswap_i16, _chdir: _chdir, _llvm_pow_f64: _llvm_pow_f64, _sbrk: _sbrk, ___errno_location: ___errno_location, _strerror: _strerror, _fstat: _fstat, _llvm_lifetime_start: _llvm_lifetime_start, _llvm_bswap_i32: _llvm_bswap_i32, __parseInt: __parseInt, _ungetc: _ungetc, _vsprintf: _vsprintf, _rename: _rename, _feof: _feof, _sysconf: _sysconf, _fread: _fread, _abort: _abort, _fprintf: _fprintf, ___buildEnvironment: ___buildEnvironment, __reallyNegative: __reallyNegative, _iscntrl: _iscntrl, _ispunct: _ispunct, _clearerr: _clearerr, _floor: _floor, _fseek: _fseek, _modf: _modf, _sqrt: _sqrt, _write: _write, _sin: _sin, _stat: _stat, _longjmp: _longjmp, _readdir_r: _readdir_r, _closedir: _closedir, _unlink: _unlink, _pwrite: _pwrite, _strerror_r: _strerror_r, _pipe: _pipe, _atan2: _atan2, _exp: _exp, _time: _time, STACKTOP: STACKTOP, STACK_MAX: STACK_MAX, tempDoublePtr: tempDoublePtr, ABORT: ABORT, NaN: NaN, Infinity: Infinity, _stdout: _stdout, _stdin: _stdin, _stderr: _stderr }, buffer);
var _testSetjmp = Module["_testSetjmp"] = asm._testSetjmp;
var _saveSetjmp = Module["_saveSetjmp"] = asm._saveSetjmp;
var _tolower = Module["_tolower"] = asm._tolower;
var _free = Module["_free"] = asm._free;
var _main = Module["_main"] = asm._main;
var _perl_eval = Module["_perl_eval"] = asm._perl_eval;
var _realloc = Module["_realloc"] = asm._realloc;
var _memset = Module["_memset"] = asm._memset;
var _malloc = Module["_malloc"] = asm._malloc;
var _memcpy = Module["_memcpy"] = asm._memcpy;
var _strlen = Module["_strlen"] = asm._strlen;
var _calloc = Module["_calloc"] = asm._calloc;
var dynCall_iiii = Module["dynCall_iiii"] = asm.dynCall_iiii;
var dynCall_i = Module["dynCall_i"] = asm.dynCall_i;
var dynCall_vi = Module["dynCall_vi"] = asm.dynCall_vi;
var dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = asm.dynCall_iiiiiiiiiii;
var dynCall_vii = Module["dynCall_vii"] = asm.dynCall_vii;
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm.dynCall_iiiiiii;
var dynCall_ii = Module["dynCall_ii"] = asm.dynCall_ii;
var dynCall_viii = Module["dynCall_viii"] = asm.dynCall_viii;
var dynCall_ff = Module["dynCall_ff"] = asm.dynCall_ff;
var dynCall_v = Module["dynCall_v"] = asm.dynCall_v;
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm.dynCall_iiiiiiiii;
var dynCall_iiiii = Module["dynCall_iiiii"] = asm.dynCall_iiiii;
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm.dynCall_iiiiiiii;
var dynCall_iii = Module["dynCall_iii"] = asm.dynCall_iii;
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm.dynCall_iiiiii;
var dynCall_viiii = Module["dynCall_viiii"] = asm.dynCall_viiii;
Runtime.stackAlloc = function(size) { return asm.stackAlloc(size) };
Runtime.stackSave = function() { return asm.stackSave() };
Runtime.stackRestore = function(top) { asm.stackRestore(top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module.callMain(args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}