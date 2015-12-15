
// Only accept (non-null return) versions that start with "number.number.number" where the last number is optional
// This strips content off that is after the last number
// also accepts dashes instead of periods
exports.cleanVersion = function(version) {
  // var three_digits = /^(\d{0,2})(\.|-)(\d{0,2})(\.|-)(\d{0,2})/.exec(version);
  // // console.log(three_digits);
  // if (three_digits) {
  //   return three_digits[1] + "." + three_digits[3] + "." + three_digits[5];
  // } else {
  //   var two_digits = /^(\d{0,2})(\.|-)(\d{0,2})/.exec(version);
  //   if (two_digits)
  //     return two_digits[1] + "." + two_digits[3];
  // }
  var digits = /^\(?(\d+:)?(\d{1,2}((\.|-)\d{1,3})*)/.exec(version);
  if(digits) {
    return digits[2].replace('-', '.');
  }
  return null;
}

exports.is_vulnerable = function(vCurrent, vFixed) {
  // Strip the versions into semantic versions
  vFixedClean = exports.cleanVersion(vFixed);
  vCurrentClean = exports.cleanVersion(vCurrent);
  // Use comparison library from SO
  // http://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
  return vFixedClean != null && vCurrentClean != null && versionCompare(vFixedClean, vCurrentClean) == 1;
}

function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

// tests = [
//   "2012.05.30.20120611-1",
//   "2.3.3.720-1",
//   "0.3-1",
//   "(0.1.1.19-rc-1)",
//   "3:3.40.3"
// ]

// for (i in tests) {
//   console.log(tests[i] + " -> " + exports.cleanVersion(tests[i]));
// }

// console.log(is_vulnerable("1.6.9", "1.6.100"));