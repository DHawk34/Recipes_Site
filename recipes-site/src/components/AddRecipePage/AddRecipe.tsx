import React from 'react';
import './AddRecipe.css';
import Dropzone from 'react-dropzone';
import { Trashcan } from '../icons/trashcan';
import { Star } from '../icons/star';
import { Fire } from '../icons/fire';
import { Refresh } from '../icons/refresh';
import config from '../../config.json'

export type AddRecipeState = {
    finishedDishImage: File | undefined,
    ingredients: { name: string, amount: number }[],
    instruction_steps: { instruction: string | undefined, image: File | undefined }[]
}

export class AddRecipe extends React.Component<{}, AddRecipeState> {

    constructor(props: any) {
        super(props);
        this.state = {
            finishedDishImage: undefined,
            ingredients: [],
            instruction_steps: [
                {
                    instruction: undefined,
                    image: undefined
                }
            ]
        }
        document.title = 'Добавление рецепта'
    }

    onUnload = (e: any) => {
        e.preventDefault();
        e.returnValue = '';
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onUnload);
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload);
    }

    spawnDragAndDrop = (image: File | undefined, alter: string) => {
        if (image === undefined) {
            return <p className='center_text'>Перетащите фотографию или нажмите сюда</p>
        }
        else {
            return <img className='cover_image' src={URL.createObjectURL(image)} alt={alter} />
        }
    }

    addIngredient = () => {
        var ingredientName = document.getElementById('ingredient_name') as HTMLInputElement;
        var ingredientAmount = document.getElementById('ingredient_amount') as HTMLInputElement;

        let new_list = [...this.state.ingredients, { name: ingredientName.value, amount: Number(ingredientAmount.value) }];
        this.setState({ ingredients: new_list })
        ingredientName.value = ''
        ingredientAmount.value = ''
    }

    deleteIngredient = (index: number) => {
        let list = this.state.ingredients
        list.splice(index, 1)
        this.setState({ ingredients: list })
    }



    addImageStep = (index: number, image: File) => {
        let list = this.state.instruction_steps
        list[index].image = image
        this.setState({ instruction_steps: list })
    }

    addStep = () => {
        let new_list = [...this.state.instruction_steps, { image: undefined, instruction: undefined }];
        this.setState({ instruction_steps: new_list })
    }

    deleteStep = (index: number) => {
        let list = this.state.instruction_steps
        if (list.length !== 1)
            list.splice(index, 1)
        else {
            var instructionText = document.getElementById(`instruction_step_${index}`) as HTMLInputElement;
            instructionText.value = '';
            list[index] = { image: undefined, instruction: undefined };
        }

        this.setState({ instruction_steps: list })
    }

    resetHot = () => {
        var hotButtons = document.getElementsByName(`hot`) as NodeListOf<HTMLInputElement>;

        hotButtons.forEach(button => {
            button.checked = false;
        });
    }

    validateTextInput = (target: HTMLInputElement | HTMLTextAreaElement) => {
        if (target.value === '')
            target.classList.add('incorrect_input')

    }

    clearValidate = (target: HTMLInputElement | HTMLTextAreaElement) => {
        target.classList.remove('incorrect_input')
    }

    insertInstructionText = (index: number, text: string) => {
        let list = this.state.instruction_steps
        list[index].instruction = text
        this.setState({ instruction_steps: list })
    }

    sendRecipe = async () => {
        var name = (document.getElementById(`recipe_name`) as HTMLInputElement).value;

        if (name === '')
            return

        if (this.state.finishedDishImage === undefined)
            return

        var nationalCuisine = (document.getElementById(`national_cuisine`) as HTMLInputElement).value;
        var difficult = Number((document.querySelector('input[name="difficult"]:checked') as HTMLInputElement).value);

        if (difficult === undefined)
            return;

        var hot = Number((document.querySelector('input[name="hot"]:checked') as HTMLInputElement)?.value);
        if (hot === null)
            hot = 0;

        var cookHours = Number((document.getElementById(`cook_time_hours`) as HTMLInputElement).value);
        var cookMinutes = Number((document.getElementById(`cook_time_minutes`) as HTMLInputElement).value);
        if (cookMinutes === 0 && cookHours === 0)
            return

        var cookTime = `${cookHours}:${cookMinutes}`

        var portionCount = Number((document.getElementById(`portion_сount`) as HTMLInputElement).value);
        if (portionCount === 0)
            return

        if (this.state.ingredients.length === 0)
            return

        const formData = new FormData();

        formData.append('name', name)
        formData.append('finishDishImage', this.state.finishedDishImage)

        formData.append('nationalCuisine', nationalCuisine)
        formData.append('difficult', difficult.toString())
        formData.append('hot', hot.toString())
        formData.append('cookTime', cookTime)
        formData.append('portionCount', portionCount.toString())

        for (var ingredient of this.state.ingredients) {
            formData.append('ingredients_name', ingredient.name)
            formData.append('ingredients_amount', ingredient.amount.toString())
        }

        for (var element of this.state.instruction_steps) {
            if (element.image === undefined || element.instruction === undefined)
                return
            formData.append('instruction_steps_image', element.image)
            formData.append('instruction_steps', element.instruction)
        }

        formData.append('creation_time', new Date().toISOString())

        const request = new XMLHttpRequest();
        request.open("POST", config.apiServer + "recipe/add");
        request.send(formData);
        //request.send(JSON.stringify(postRequest));
    }

    incrementPortionCount = (increment: number) => {
        var element = document.getElementById('portion_сount') as HTMLInputElement;
        var portionCount = Number(element.value);
        portionCount += increment;
        element.value = portionCount.toString();
    }

    render(): React.ReactNode {
        let ingredientsElements = this.state.ingredients.map((item: { name: string; amount: number; }, index: number) => {
            return <div className='ingredient_container' key={index}>
                <div className='ingredient_info'>
                    <b>{item.name}</b>, {item.amount} гр
                </div>
                <button className='delete_ingredient_button' onClick={() => this.deleteIngredient(index)}><Trashcan width='25px' height='25px'></Trashcan></button>
            </div>
        })

        let instructionElements = this.state.instruction_steps.map((item: { instruction: string | undefined, image: File | undefined }, index: number) => {
            return <div key={index}>
                <div className='instruction_step_header_creation'>
                    <h4 className='step_text'>Шаг {index + 1}</h4>
                    <button className='delete_ingredient_button' onClick={() => this.deleteStep(index)}><Trashcan width='25px' height='25px'></Trashcan></button>
                </div>
                <div className='instruction_step_creation'>
                    <Dropzone onDrop={acceptedFiles => {
                        this.addImageStep(index, acceptedFiles[0])
                    }}>
                        {({ getRootProps, getInputProps }) => (
                            <section>
                                <div className='instruction_step_drop' {...getRootProps()}>
                                    <input name={`instruction_step_${index}_image`} {...getInputProps()} />
                                    {this.spawnDragAndDrop(this.state.instruction_steps[index].image, `instruction_step ${index}`)}
                                </div>
                            </section>
                        )}
                    </Dropzone>
                    <textarea id={`instruction_step_${index}`} name={`instruction_step_${index}`} placeholder='Например: Помыть овощи' required onFocus={(e) => this.clearValidate(e.target)} onBlur={(e) => { this.validateTextInput(e.target); this.insertInstructionText(index, e.target.value) }}></textarea>
                </div>
            </div>
        })


        return (
            <div id='new_recipe_container'>
                <h3>Оформление рецепта</h3>
                <p>Фотография готового блюда <sup className='red'>*</sup></p>
                <Dropzone onDrop={acceptedFiles => {
                    this.setState({ finishedDishImage: acceptedFiles[0] });
                }}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div className='finished_dish' {...getRootProps()}>
                                <input name='finished_dish_image' {...getInputProps()} />
                                {this.spawnDragAndDrop(this.state.finishedDishImage, 'finished_dish')}
                            </div>
                        </section>
                    )}
                </Dropzone>
                <p>Название рецепта <sup className='red'>*</sup></p>
                <input className='input_field' id='recipe_name' name='recipe_name' type='text' placeholder='Например: Салат "Оливье"' required onFocus={(e) => this.clearValidate(e.target)} onBlur={(e) => this.validateTextInput(e.target)}></input>

                <p>Национальная кухня</p>
                <input className='input_field' id='national_cuisine' type='text' name='national_cuisine' placeholder='Например: русская'></input>

                <div className='horizontal-center'>
                    <p className='margin-right con_width'>Сложность <sup className='red'>*</sup></p>

                    <div className='radio_group' id='difficult_group'>
                        <input type="radio" name="difficult" id="difficult-5" value={5} />
                        <label htmlFor="difficult-5"><Star width='30px' height='30px' /></label>
                        <input type="radio" name="difficult" id="difficult-4" value={4} />
                        <label htmlFor="difficult-4"><Star width='30px' height='30px' /></label>
                        <input type="radio" name="difficult" id="difficult-3" value={3} />
                        <label htmlFor="difficult-3"><Star width='30px' height='30px' /></label>
                        <input type="radio" name="difficult" id="difficult-2" value={2} />
                        <label htmlFor="difficult-2"><Star width='30px' height='30px' /></label>
                        <input type="radio" name="difficult" id="difficult-1" defaultChecked value={1} />
                        <label htmlFor="difficult-1"><Star width='30px' height='30px' /></label>
                    </div>
                </div>

                <div className='horizontal-center'>
                    <p className='margin-right con_width horizontal'>Острота <button id='reset_button' onClick={this.resetHot}><Refresh width='20px' height='20px' /></button></p>

                    <div className='radio_group' id='hot_group'>
                        <input type="radio" name="hot" id="hot-5" value={5} />
                        <label htmlFor="hot-5"><Fire width='30px' height='30px' /></label>
                        <input type="radio" name="hot" id="hot-4" value={4} />
                        <label htmlFor="hot-4"><Fire width='30px' height='30px' /></label>
                        <input type="radio" name="hot" id="hot-3" value={3} />
                        <label htmlFor="hot-3"><Fire width='30px' height='30px' /></label>
                        <input type="radio" name="hot" id="hot-2" value={2} />
                        <label htmlFor="hot-2"><Fire width='30px' height='30px' /></label>
                        <input type="radio" name="hot" id="hot-1" value={1} />
                        <label htmlFor="hot-1"><Fire width='30px' height='30px' /></label>
                    </div>
                </div>

                <p>Время приготовления <sup className='red'>*</sup></p>
                <div className='horizontal'>
                    <input className='input_number' id='cook_time_hours' type='number' name='cook_time_hours' defaultValue={0} required></input>
                    <label htmlFor="cook_time_hours" id='cook_time_hours_label'>&nbsp;&nbsp;часов</label>

                    <input className='input_number' id='cook_time_minutes' type='number' name='cook_time_minutes' defaultValue={0} required></input>
                    <label htmlFor="cook_time_minutes">&nbsp;&nbsp;минут</label>
                </div>
                <p>Порции <sup className='red'>*</sup></p>
                <div className='horizontal'>
                    <button className='button increment_button' onClick={() => this.incrementPortionCount(-1)}>-</button>
                    <input className='input_number' id='portion_сount' type='number' name='portion_сount' defaultValue={1} required></input>
                    <button className='button increment_button' onClick={() => this.incrementPortionCount(1)}>+</button>
                </div>

                <p>Ингредиенты <sup className='red'>*</sup></p>
                <div className='ingredients'>
                    {ingredientsElements}
                </div>

                <hr />
                <input className='input_field' id='ingredient_name' type='text' name='ingredient_name' placeholder='Например: Курица'></input>
                <div className='horizontal'>
                    <input className='half_width input_number left_text margin_top' id='ingredient_amount' type='number' name='ingredient_amount' placeholder='Количество'></input>
                    <label htmlFor="ingredient_amount" className='half_width margin_top'>&nbsp;&nbsp;грамм</label>
                </div>
                <button className='button margin_top full_width' onClick={this.addIngredient}>Добавить ингредиент</button>
                <h3>Пошаговая инструкция <sup className='red'>*</sup></h3>
                <div className='instruction'>
                    {instructionElements}
                </div>

                <button className='button margin_top full_width' onClick={this.addStep}>Добавить шаг</button>

                <button type="submit" className='button margin_top full_width submit_button' onClick={this.sendRecipe}>Отправить</button>
            </div>
        );
    }
}