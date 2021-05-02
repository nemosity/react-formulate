export const joinPath = (id: string, path: string) => path ? path + id + id : id;
export const addIndex = (path: string, index: number) => `${path}[${index}]`;
