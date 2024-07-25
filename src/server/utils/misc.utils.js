const makeSortQuery = (sortDescription, orderDescription) => {
    const { sorts, defAttr } = sortDescription;
    const { orders, defOrd } = orderDescription;

    let sortAttrs = [defAttr];
    if (sorts) sortAttrs = sorts.split("@");
    if (!sortAttrs[sortAttrs.length - 1]) sortAttrs.pop();

    let sortOrds = defOrd;
    if (orders) sortOrds = orders;
    while (sortOrds.length < sortAttrs.length) sortOrds += "1";

    const sortq = {};
    for (let i = 0; i < sortAttrs.length; i += 1)
        sortq[sortAttrs[i]] = !parseInt(sortOrds[i], 10) ? -1 : 1;

    return sortq;
};

export { makeSortQuery };
