function _serialize(obj: any): string {
  if (Array.isArray(obj)) {
    return `[${obj.map(el => _serialize(el)).join(',')}]`
  } else if (typeof obj === 'object' && obj !== null) {
    let acc  = ''
    const keys = Object.keys(obj).sort()
    acc += `{${JSON.stringify(keys)}`
    for (let i = 0; i < keys.length; i++) {
      acc += `${_serialize(obj[keys[i]])},`
    }
    return `${acc}}`
  }

  return `${JSON.stringify(obj)}`
}

/**
 * Serializes a JSON object (not any random JS object).
 *
 * It should be noted that JS objects can have members of
 * specific type (e.g. function), that are not supported
 * by JSON.
 *
 * @param {Object} obj JSON object
 * @returns {String} stringified JSON object.
 */
function serialize (obj: any) {
  return _serialize(obj)
}

async function hash(s: string, alg: AlgorithmIdentifier = 'SHA-256') {
    const utf8 = new TextEncoder().encode(s);
    const hashBuffer = await crypto.subtle.digest(alg, utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

export {
  serialize,
  hash
}