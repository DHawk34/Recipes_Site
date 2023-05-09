import { StylesConfig } from "react-select";

export type IsMulti = false;

export function SelectStyle<T>() {
    const mySelectStyle: StylesConfig<T> = {
        control: (styles, { isFocused }) => {
            return {
                ...styles,
                borderRadius: '8px',
                borderColor: 'gray',
                minHeight: '40px',
                boxShadow: isFocused ? '0 0 0 1px black' : '',

                ':hover': {
                    ...styles[':hover'],
                    borderColor: 'gray'
                },
                ':active': {
                    ...styles[':active'],
                    borderColor: 'black',
                }
            }
        },
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            //const color = chroma(data.color);
            return {
                ...styles,
                backgroundColor: isFocused && !isSelected ? 'lightgray' : isSelected ? 'gray' : 'transparent',

                ':active': {
                    ...styles[':active'],
                    backgroundColor: !isDisabled
                        ? isSelected
                            ? 'gray'
                            : 'lightgray'
                        : undefined,
                },
                ':hover': {
                    ...styles[':hover'],
                    backgroundColor: isSelected ? 'gray' : 'lightgray'
                },
            };
        },
    };
    return mySelectStyle
}