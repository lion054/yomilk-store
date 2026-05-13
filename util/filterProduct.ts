// Filter Products By Filters

export default (productList: any, filters: any) => {
    let filteredList = [...productList];

    for (const key in filters) {
        if (key !== "price") {
            if (
                filters[key] === "featured" ||
                filters[key] === "trending" ||
                filters[key] === "lowToHigh" ||
                filters[key] === "highToLow"
            ) {
                if (filters[key] === "lowToHigh") {
                    filteredList = [
                        ...filteredList.sort((a: any, b: any) => {
                            if (a.price < b.price) return -1;
                            if (a.price > b.price) return 1;
                            return 0;
                        }),
                    ];
                } else {
                    if (filters[key] === "highToLow") {
                        filteredList = [
                            ...filteredList.sort((a: any, b: any) => {
                                if (b.price < a.price) return -1;
                                if (b.price > a.price) return 1;
                                return 0;
                            }),
                        ];
                    } else {
                        filteredList = filteredList.filter(
                            (item: any) => item[filters[key]]
                        );
                    }
                }
            } else {
                filteredList = filterByKey(filteredList, filters[key], key);
            }
        } else {
            filteredList = filterByPrice(filteredList, filters[key], key);
        }
    }
    return filteredList;
};

// Filter Product By Price

function filterByPrice(filteredList: any, price: any, key: any) {
    let list = [];

    for (let index = 0; index < filteredList.length; index++) {
        const product = filteredList[index];
        const productPrice = product[key];

        if (productPrice >= price.min && productPrice <= price.max) {
            list.push(product);
        }
    }

    return (filteredList = list);
}

// Filter Product by key size/category/brand etc

function filterByKey(filteredList: any, size: any, key: any) {
    let list = [];
    if (!size || size.length === 0) return filteredList;
    for (let index = 0; index < filteredList.length; index++) {
        const product = filteredList[index];

        if (size.indexOf != undefined) {
            const isOk = size && size.indexOf(product[key]);
            if (isOk !== -1) {
                list.push(product);
            }
        }
    }

    return (filteredList = list);
}
