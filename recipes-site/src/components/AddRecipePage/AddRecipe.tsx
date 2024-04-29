import { SetStateAction, useEffect, useState } from 'react';
import './AddRecipe.css';
import Dropzone from 'react-dropzone';
import { ReactComponent as Trashcan} from '@/assets/trashcan.svg';
import { ReactComponent as Star} from '@/assets/star.svg';
import { ReactComponent as Fire} from '@/assets/fire.svg';
import { ReactComponent as Refresh} from '@/assets/refresh.svg';
import config from '../../config.json'
import Select, { MultiValue, SingleValue } from 'react-select';
import { ActionMeta } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { SelectStyle } from '../../styles';
import IdNameModel from '../../models/idNameModel';
import { useQuery } from 'react-query';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { addMeta } from '../../utils/utils';
import RecipeModel from '../../models/recipeModel';

type MyOptionTypeInt = {
    label: string;
    value: number;
};
type OnChangeInt = (option: MyOptionTypeInt, actionMeta: ActionMeta<MyOptionTypeInt>) => void;

type MyOptionTypeString = {
    label: string;
    value: string;
};

const mySelectStyle = SelectStyle<MyOptionTypeInt>()
const mySelectStyleString = SelectStyle<MyOptionTypeString>()


// export type AddRecipeState = {
//     finishedDishImage: File | undefined,
//     ingredients: { name: string, amount: number }[],
//     instruction_steps: { instruction: string | undefined, image: File | undefined }[]
// }

export function AddRecipe() {
    const match = useMatch('/recipes/:id/:ed');
    const [finishedDishImage, setFinishDishImage] = useState<File | undefined>(undefined);
    const [groupSelectedOption, setGroupOption] = useState<MyOptionTypeInt | undefined>(undefined);
    const [nCuisineSelectedOption, setCuisineOption] = useState<MyOptionTypeString | undefined>(undefined);
    const [hot, setHot] = useState<number>(0);
    const [hours, setHours] = useState<string>('0');
    const [minutes, setMinutes] = useState<string>('0');
    const [difficult, setDifficult] = useState<number>(1);
    const [portion, setPortion] = useState<number>(1);
    const [selectedIngredients, setSelectedIngredients] = useState<{ name: string, amount: number }[]>([]);
    const [instruction_steps, setInstructionStep] = useState<{ instruction: string | undefined, image: File | undefined }[]>([{ instruction: undefined, image: undefined }]);
    const [header, setHeader] = useState<string>('Оформление рецепта');

    const location = useLocation()
    const myState = location.state

    const navigate = useNavigate();

    var ingredientNameSelect: any = null;
    var groupSelect: any = null;
    var nationalCuisineSelect: any = null;

    const { data: recipeFromServerResponse } = useQuery(`recipe-${match?.params.id}`, () => fetchData(`recipe?id=${match?.params.id}`), { enabled: match != null });
    let recipe: RecipeModel = recipeFromServerResponse

    //groups
    const { data: groupsFromServerResponse } = useQuery('groups', () => fetchData('recipe-groups'));
    var groups: MyOptionTypeInt[] = [];

    var groupsFromServer: Array<IdNameModel> = groupsFromServerResponse

    groupsFromServer?.forEach(element => {
        groups.push({ value: element.id, label: element.name });
    });

    //ingredients
    const { data: ingredientsFromServerResponse } = useQuery('ingredients', () => fetchData('ingredients'));
    var allIngredients: MyOptionTypeString[] = [];

    var ingredientsFromServer: Array<IdNameModel> = ingredientsFromServerResponse

    ingredientsFromServer?.forEach(element => {
        allIngredients.push({ value: element.name, label: element.name });
    });

    //cuisines
    const { data: cuisinesFromServerResponse } = useQuery('cuisines', () => fetchData('cuisines'));
    var allCuisines: MyOptionTypeString[] = [];

    var cuisinesFromServer: Array<IdNameModel> = cuisinesFromServerResponse

    cuisinesFromServer?.forEach(element => {
        allCuisines.push({ value: element.name, label: element.name });
    });

    useEffect(() => {
        document.title = match ? 'Изменение рецепта' : 'Добавление рецепта'
        addMeta('description', match ? 'Изменение рецепта' : 'Добавление рецепта')
        addMeta('keywords', 'Новинки')

        window.addEventListener("beforeunload", onUnload);
        return () => {
            window.removeEventListener("beforeunload", onUnload);
        }
    }, [])

    useEffect(() => {
        if (!match || !recipe)
            return

        function compareIndexFound(a: { step: number; instructionImage: number; instructionText: string; }, b: { step: number; instructionImage: number; instructionText: string; }) {
            if (a.step < b.step) { return -1; }
            if (a.step > b.step) { return 1; }
            return 0;
        }
        recipe?.recipeInstructions.sort(compareIndexFound)

        fetch(config.apiServer + `image?id=${recipe.finishImage}`).then(res => res.blob().then((blob) => {
            // please change the file.extension with something more meaningful
            // or create a utility function to parse from URL
            const file = new File([blob], `image`, { type: blob.type })
            setFinishDishImage(file);
        }));

        (document.getElementById(`recipe_name`) as HTMLInputElement).value = recipe.name;
        setGroupOption({ label: recipe.groupNavigation.name, value: recipe.groupNavigation.id });
        setCuisineOption({ label: recipe.nationalCuisineNavigation.name, value: recipe.nationalCuisineNavigation.name });

        if (recipe.hot > 0)
            setHot(recipe.hot)

        setDifficult(recipe.difficult)
        setPortion(recipe.portionCount)
        let ingredients: { name: string, amount: number }[] = []
        recipe.recipeIngredients.forEach(ingr => {
            ingredients.push({ name: ingr.ingredientNavigation.name, amount: ingr.amount })
        });
        setSelectedIngredients(ingredients);

        let instructions_step: { instruction: string | undefined, image: File | undefined }[] = []

        recipe.recipeInstructions.forEach(instr => {
            fetch(config.apiServer + `image?id=${instr.instructionImage}`).then(res => res.blob().then((blob) => {
                const file = new File([blob], `image`, { type: blob.type })
                instructions_step.push({ instruction: instr.instructionText, image: file });
                setInstructionStep(instructions_step);
            }));
        });

        var time = recipe.cookTime.split(':');

        let hours = time[0]
        let minutes = time[1]

        setHours(hours);
        setMinutes(minutes);

        setHeader('Изменение рецепта')
        // setInstructionStep(instructions_step);

    }, [recipe])

    useEffect(() => {
        if (myState != null && myState.myState.refresh) {
            resetStates()
        }
    }, [myState]);
    function resetStates() {
        setFinishDishImage(undefined);
        setGroupOption(undefined);
        setCuisineOption(undefined);
        setHot(0);
        setHours('0');
        setMinutes('0');
        setDifficult(1);
        setPortion(1);
        setSelectedIngredients([]);
        setInstructionStep([{ instruction: undefined, image: undefined }]);
        setHeader('Оформление рецепта');
    }

    const handleGroupChange = (selectedOption?: MultiValue<MyOptionTypeInt> | SingleValue<MyOptionTypeInt>) => {
        if (typeof (selectedOption) === 'number') {
            setGroupOption(groups.at(selectedOption as any));
        }
        else {
            setGroupOption(selectedOption as MyOptionTypeInt);
        }
    }

    const handleCusineChange = (selectedOption?: MultiValue<MyOptionTypeString> | SingleValue<MyOptionTypeString>) => {
        if (typeof (selectedOption) === 'number') {
            setCuisineOption(allCuisines.at(selectedOption as any));
        }
        else {
            setCuisineOption(selectedOption as MyOptionTypeString);
        }
    }

    const fetchData = async (method: string) => {
        return fetch(config.apiServer + method)
            .then(res => res.json())
    }

    const onUnload = (e: any) => {
        e.preventDefault();
        e.returnValue = '';
    }

    const spawnDragAndDrop = (image: File | undefined, alter: string) => {
        if (image === undefined) {
            return <p className='center_text'>Перетащите фотографию или нажмите сюда</p>
        }
        else {
            return <img className='cover_image' src={URL.createObjectURL(image)} alt={alter} />
        }
    }

    const addIngredient = () => {
        var ingredientName = ingredientNameSelect.getValue() as { label: string, value: string }[]
        if (ingredientName.length === 0) {
            alert('Введите название ингердиента!')
            return
        }

        if (selectedIngredients.find(x => x.name === ingredientName[0].value)) {
            alert('Данный ингредиент уже выбран!')
            return
        }

        var ingredientAmount = document.getElementById('ingredient_amount') as HTMLInputElement;
        let new_list = [...selectedIngredients, { name: ingredientName[0].value, amount: Number(ingredientAmount.value) }];
        setSelectedIngredients(new_list);
        ingredientAmount.value = ''
        ingredientNameSelect.clearValue()
    }

    const deleteIngredient = (index: number) => {
        let list = [...selectedIngredients]
        list.splice(index, 1)
        setSelectedIngredients(list)
    }


    const addImageStep = (index: number, image: File) => {
        let list = instruction_steps
        list[index].image = image
        setInstructionStep(list);
    }

    const addStep = () => {
        let new_list = [...instruction_steps, { image: undefined, instruction: undefined }];
        setInstructionStep(new_list)
    }

    const deleteStep = (index: number) => {
        let list = [...instruction_steps]
        if (list.length !== 1)
            list.splice(index, 1)
        else {
            var instructionText = document.getElementById(`instruction_step_${index}`) as HTMLInputElement;
            instructionText.value = '';
            list[index] = { image: undefined, instruction: undefined };
        }

        setInstructionStep(list)
    }

    const resetHot = () => {
        var hotButtons = document.getElementsByName(`hot`) as NodeListOf<HTMLInputElement>;

        hotButtons.forEach(button => {
            button.checked = false;
        });
    }

    const validateInputField = (target: HTMLInputElement | HTMLTextAreaElement, targetId?: string, testValue?: string | null | undefined) => {
        let value = testValue ? testValue : target.value;

        if (value === '') {
            if (targetId)
                document.getElementById(targetId)?.classList.add('incorrect_input')
            else
                target.classList.add('incorrect_input')
        }

    }

    const clearValidate = (target: HTMLInputElement | HTMLTextAreaElement, targetId?: string) => {
        // console.log(target)
        if (targetId)
            document.getElementById(targetId)?.classList.remove('incorrect_input')
        else
            target.classList.remove('incorrect_input')
    }

    const insertInstructionText = (index: number, text: string) => {
        let list = [...instruction_steps]
        list[index].instruction = text
        setInstructionStep(list)
    }

    const sendRecipe = async () => {
        var name = (document.getElementById(`recipe_name`) as HTMLInputElement).value;

        if (name === '') {
            (document.getElementById(`recipe_name`) as HTMLInputElement)?.scrollIntoView(false)
            alert('Заполните название рецепта!')
            return
        }

        if (finishedDishImage === undefined) {
            document.getElementsByClassName('finished_dish').item(0)?.scrollIntoView(false)
            alert('Загрузите фотографию готового блюда!')
            return
        }

        var group = groupSelect.getValue() as MyOptionTypeInt[]
        if (group.length === 0 || groupSelectedOption == null) {
            document.getElementById('group_input_field')?.scrollIntoView(false)
            alert('Выберите группу для рецепта!')
            return
        }

        var groupId = groupSelectedOption.value

        var n_cuisine = '';

        if (nCuisineSelectedOption)
            n_cuisine = nCuisineSelectedOption.value;

        if (difficult < 1) {
            alert('Выберите сложность!')
            return;
        }

        var cookHours = Number(hours);
        var cookMinutes = Number(minutes);
        if (cookMinutes === 0 && cookHours === 0) {
            document.getElementById(`cook_time_hours`)?.scrollIntoView()
            alert('Укажите правильное время готовки!')
            return
        }

        var cookTime = `${cookHours}:${cookMinutes}`

        var portionCount = Number((document.getElementById(`portion_сount`) as HTMLInputElement).value);
        if (portionCount === 0) {
            document.getElementById('portion_сount')?.scrollIntoView(false)
            alert('Укажите правильное количество порций!')
            return
        }

        if (selectedIngredients.length === 0) {
            alert('Добавьте ингредиенты!')
            return
        }

        const formData = new FormData();

        formData.append('name', name)
        formData.append('finishDishImage', finishedDishImage)
        formData.append('group', groupId.toString())

        formData.append('nationalCuisine', n_cuisine)
        formData.append('difficult', difficult.toString())
        formData.append('hot', hot.toString())
        formData.append('cookTime', cookTime)
        formData.append('portionCount', portionCount.toString())

        for (var ingredient of selectedIngredients) {
            formData.append('ingredients_name', ingredient.name)
            formData.append('ingredients_amount', ingredient.amount.toString())
        }

        for (var element of instruction_steps) {
            if (element.image === undefined || element.instruction === undefined) {
                document.getElementsByClassName('instruction').item(0)?.scrollIntoView(false);
                alert('Заполните пропуски в инструкции!')
                return
            }
            formData.append('instruction_steps_image', element.image)
            formData.append('instruction_steps', element.instruction)
        }

        formData.append('creation_time', new Date().toISOString())

        const request = new XMLHttpRequest();

        if (!match) {
            request.open("POST", config.apiServer + "recipe/add");
            request.send(formData);

            request.onload = () => {
                console.log(request.response)
                navigate('/recipes/' + request.response)
            }
            request.onerror = () => [
                alert('Ошибка при добавлении рецепта')
            ]
        }
        else {
            request.open("PUT", config.apiServer + `recipe/update?id=${match.params.id}`);
            request.send(formData);

            request.onload = () => {
                console.log(request.response)
                navigate('/recipes/' + request.response)
            }
            request.onerror = () => [
                alert('Ошибка при изменении рецепта')
            ]
        }

    }

    const incrementPortionCount = (increment: number) => {
        var element = document.getElementById('portion_сount') as HTMLInputElement;
        var portionCount = Number(element.value);
        portionCount += increment;

        if (portionCount >= 1)
            element.value = portionCount.toString();
    }

    const validateInputNumper = (e: React.ChangeEvent<HTMLInputElement>, min?: number, max?: number) => {
        let value = e.target.value;
        e.target.value = value.replace(/([^0-9.]+)/, min ? min.toString() : '');

        if (min !== undefined) {
            if (Number(e.target.value) < min) {
                e.target.value = min.toString()
            }
        }
        else {
            if (e.target.value === '0')
                e.target.value = '1';
        }

        if (max) {
            if (Number(e.target.value) > max)
                e.target.value = max.toString()
        }
    }

    const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

    let ingredientsElements = selectedIngredients.map((item: { name: string; amount: number; }, index: number) => {
        return <div className='ingredient_container' key={index}>
            <div className='ingredient_info'>
                <b>{item.name}</b>, {item.amount} гр
            </div>
            <button className='delete_ingredient_button' onClick={() => deleteIngredient(index)}><Trashcan width='25px' height='25px'></Trashcan></button>
        </div>
    })

    let instructionElements = instruction_steps.map((item: { instruction: string | undefined, image: File | undefined }, index: number) => {
        return <div key={index}>
            <div className='instruction_step_header_creation'>
                <h4 className='step_text'>Шаг {index + 1}</h4>
                <button className='delete_ingredient_button' onClick={() => deleteStep(index)}><Trashcan width='25px' height='25px'></Trashcan></button>
            </div>
            <div className='instruction_step_creation'>
                <Dropzone onDrop={acceptedFiles => {
                    addImageStep(index, acceptedFiles[0])
                }}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div className='instruction_step_drop' {...getRootProps()}>
                                <input name={`instruction_step_${index}_image`} {...getInputProps()} />
                                {spawnDragAndDrop(instruction_steps[index].image, `instruction_step ${index}`)}
                            </div>
                        </section>
                    )}
                </Dropzone>
                <textarea id={`instruction_step_${index}`} name={`instruction_step_${index}`} value={instruction_steps[index].instruction} onChange={(e) => insertInstructionText(index, e.target.value)} placeholder='Например: Помыть овощи' required onFocus={(e) => clearValidate(e.target)} onBlur={(e) => { validateInputField(e.target) }}></textarea>
            </div>
        </div>
    })



    return (
        <div id='new_recipe_container'>
            <h3>{header}</h3>
            <p>Фотография готового блюда <sup className='red'>*</sup></p>
            <Dropzone onDrop={acceptedFiles => {
                setFinishDishImage(acceptedFiles[0])
            }}>
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div className='finished_dish' {...getRootProps()}>
                            <input name='finished_dish_image' {...getInputProps()} />
                            {spawnDragAndDrop(finishedDishImage, 'finished_dish')}
                        </div>
                    </section>
                )}
            </Dropzone>
            <p>Название рецепта <sup className='red'>*</sup></p>
            <input className='input_field' id='recipe_name' name='recipe_name' type='text' placeholder='Например: Салат "Оливье"' required onFocus={(e) => clearValidate(e.target)} onBlur={(e) => validateInputField(e.target)}></input>
            <p>Группа <sup className='red'>*</sup></p>
            <Select ref={(ref) => groupSelect = ref} options={groups} onChange={(val) => handleGroupChange(val)} value={groupSelectedOption} name='recipe_group' id='group_input_field' classNamePrefix='select_input_field_prefix' placeholder='Выберите группу' styles={mySelectStyle} onFocus={(e) => clearValidate(e.target, 'group_input_field')} onBlur={(e) => validateInputField(e.target, 'group_input_field', e.target.parentNode?.parentNode?.firstChild?.textContent !== 'Выберите группу' ? e.target.parentNode?.parentNode?.firstChild?.textContent : '')} noOptionsMessage={() => 'Такой группы нет'}></Select>
            <p>Национальная кухня</p>
            <CreatableSelect ref={(ref) => nationalCuisineSelect = ref} options={allCuisines} onChange={(val) => handleCusineChange(val)} value={nCuisineSelectedOption} name='national_cuisine' id='national_cuisine' classNamePrefix='select_input_field_prefix' placeholder='Например: Русская' formatCreateLabel={(userInput) => `Добавить "${userInput}"`} styles={mySelectStyleString} noOptionsMessage={() => 'Уже выбрано'} />

            <div className='horizontal-center'>
                <p className='margin-right con_width'>Сложность <sup className='red'>*</sup></p>

                <div className='radio_group' id='difficult_group'>
                    <input type="radio" name="difficult" id="difficult-5" value={5} checked={difficult === 5} onChange={() => setDifficult(5)} />
                    <label htmlFor="difficult-5"><Star width='30px' height='30px' /></label>
                    <input type="radio" name="difficult" id="difficult-4" value={4} checked={difficult === 4} onChange={() => setDifficult(4)} />
                    <label htmlFor="difficult-4"><Star width='30px' height='30px' /></label>
                    <input type="radio" name="difficult" id="difficult-3" value={3} checked={difficult === 3} onChange={() => setDifficult(3)} />
                    <label htmlFor="difficult-3"><Star width='30px' height='30px' /></label>
                    <input type="radio" name="difficult" id="difficult-2" value={2} checked={difficult === 2} onChange={() => setDifficult(2)} />
                    <label htmlFor="difficult-2"><Star width='30px' height='30px' /></label>
                    <input type="radio" name="difficult" id="difficult-1" value={1} checked={difficult === 1} onChange={() => setDifficult(1)} />
                    <label htmlFor="difficult-1"><Star width='30px' height='30px' /></label>
                </div>
            </div>

            <div className='horizontal-center'>
                <p className='margin-right con_width horizontal'>Острота <button id='reset_button' onClick={resetHot}><Refresh width='20px' height='20px' /></button></p>

                <div className='radio_group' id='hot_group'>
                    <input type="radio" name="hot" id="hot-5" value={5} checked={hot === 5} onChange={() => setHot(5)} />
                    <label htmlFor="hot-5"><Fire width='30px' height='30px' /></label>
                    <input type="radio" name="hot" id="hot-4" value={4} checked={hot === 4} onChange={() => setHot(4)} />
                    <label htmlFor="hot-4"><Fire width='30px' height='30px' /></label>
                    <input type="radio" name="hot" id="hot-3" value={3} checked={hot === 3} onChange={() => setHot(3)} />
                    <label htmlFor="hot-3"><Fire width='30px' height='30px' /></label>
                    <input type="radio" name="hot" id="hot-2" value={2} checked={hot === 2} onChange={() => setHot(2)} />
                    <label htmlFor="hot-2"><Fire width='30px' height='30px' /></label>
                    <input type="radio" name="hot" id="hot-1" value={1} checked={hot === 1} onChange={() => setHot(1)} />
                    <label htmlFor="hot-1"><Fire width='30px' height='30px' /></label>
                </div>
            </div>

            <p>Время приготовления <sup className='red'>*</sup></p>
            <div className='horizontal'>
                <input className='input_number' id='cook_time_hours' type='number' name='cook_time_hours' value={hours} required onChange={(e) => { validateInputNumper(e, 0, 100); setHours(e.target.value) }} onKeyDown={blockInvalidChar}></input>
                <label htmlFor="cook_time_hours" id='cook_time_hours_label'>&nbsp;&nbsp;часов</label>

                <input className='input_number' id='cook_time_minutes' type='number' name='cook_time_minutes' value={minutes} required onChange={(e) => { validateInputNumper(e, 0, 59); setMinutes(e.target.value) }} onKeyDown={blockInvalidChar}></input>
                <label htmlFor="cook_time_minutes">&nbsp;&nbsp;минут</label>
            </div>
            <p>Порции <sup className='red'>*</sup></p>
            <div className='horizontal'>
                <button className='button increment_button' onClick={() => incrementPortionCount(-1)}>-</button>
                <input className='input_number' id='portion_сount' type='number' name='portion_сount' min={1} value={portion.toString()} onChange={(e) => { validateInputNumper(e); setPortion(Number(e.target.value)); }} onKeyDown={blockInvalidChar} required></input>
                <button className='button increment_button' onClick={() => incrementPortionCount(1)}>+</button>
            </div>

            <p>Ингредиенты <sup className='red'>*</sup></p>
            <div className='ingredients'>
                {ingredientsElements}
            </div>

            <hr />
            <CreatableSelect ref={(ref) => ingredientNameSelect = ref} options={allIngredients} name='ingredient_name' id='group_input_field' classNamePrefix='select_input_field_prefix' placeholder='Например: Курица' styles={mySelectStyleString} formatCreateLabel={(userInput) => `Добавить "${userInput}"`} noOptionsMessage={() => 'Уже выбрано'} />
            <div className='horizontal'>
                <input className='half_width input_number left_text margin_top' id='ingredient_amount' type='number' name='ingredient_amount' placeholder='Количество'></input>
                <label htmlFor="ingredient_amount" className='half_width margin_top'>&nbsp;&nbsp;грамм</label>
            </div>
            <button className='button margin_top full_width' onClick={addIngredient}>Добавить ингредиент</button>
            <h3>Пошаговая инструкция <sup className='red'>*</sup></h3>
            <div className='instruction'>
                {instructionElements}
            </div>

            <button className='button margin_top full_width' onClick={addStep}>Добавить шаг</button>

            <button type="submit" className='button margin_top full_width submit_button' onClick={sendRecipe}>Отправить</button>
        </div>
    );
}
