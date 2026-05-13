// Delete Product from List By Id
export const deleteProduct = (list: any, id: any) => {
    const filter = list.filter((item: any) => item.id !== id);
    return filter;
  };

  // Find Product Index From List
  export const findProductIndex = (list: any, slug: any) => {
    const index = list.findIndex((item: any) => item.slug === slug);
    return index;
  };
  export const findProductIndexById = (list: any, id: any) => {
    const index = list.findIndex((item: any) => item.id === id);
    return index;
  };
  