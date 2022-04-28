/**
 * Copyright 2018 Zachary Rauen
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

interface FindInTreeOptions {
    walkable?: string[];
    ignore?: string[];
}

const { hasOwnProperty } = Object.prototype;

/**
 * Finds a value, subobject, or array from a tree that matches a specific filter. Great for patching render functions.
 * @param {object} tree React tree to look through. Can be a rendered object or an internal instance.
 * @param {callable} searchFilter Filter function to check subobjects against.
 */
export function findInReactTree(tree: object, searchFilter: (tree: any) => boolean): any {
    return findInTree(tree, searchFilter, { walkable: ["props", "children", "child", "sibling"] });
}

/**
 * Finds a value, subobject, or array from a tree that matches a specific filter.
 * @param {object} tree Tree that should be walked
 * @param {callable} searchFilter Filter to check against each object and subobject
 * @param {object} options Additional options to customize the search
 * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
 * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
 */
export function findInTree(
    tree: object,
    searchFilter: (tree: any) => boolean,
    { walkable = undefined, ignore = [] }: FindInTreeOptions = {}
): any {
    if (typeof searchFilter === "string") {
        if (hasOwnProperty.call(tree, searchFilter)) return tree[searchFilter];
    } else if (searchFilter(tree)) {
        return tree;
    }

    if (typeof tree !== "object" || tree == null) return undefined;

    let tempReturn;
    if (Array.isArray(tree)) {
        for (const value of tree) {
            tempReturn = findInTree(value, searchFilter, { walkable, ignore });
            if (typeof tempReturn != "undefined") return tempReturn;
        }
    } else {
        const toWalk = walkable == null ? Object.keys(tree) : walkable;
        for (const key of toWalk) {
            if (!hasOwnProperty.call(tree, key) || ignore.includes(key)) continue;
            tempReturn = findInTree(tree[key as keyof typeof tree], searchFilter, { walkable, ignore });
            if (typeof tempReturn != "undefined") return tempReturn;
        }
    }
    return tempReturn;
}
