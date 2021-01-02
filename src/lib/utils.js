const waitTimeMilliseconds = (waitMsec) => {
    const startMsec = new Date();

    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec) ;
    return true
}

exports.waitTimeMilliseconds = waitTimeMilliseconds