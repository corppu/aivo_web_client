
export function flagHidden(nodes, filter) {
    return nodes.map((node) => {
        if (filter.length === 0) {
            return Object.assign({}, node, { hidden: false });
        }
        if (node.title.includes(filter)) {
            return Object.assign({}, node, { hidden: true });
        }
        return Object.assign({}, node, { hidden: false });
    });
}
