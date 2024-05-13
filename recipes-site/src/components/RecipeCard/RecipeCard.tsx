import { useRef } from 'react';
import styles from './RecipeCard.module.css'
import { useNavigate } from 'react-router-dom';
import ENDPOINTS from '@/endPoints';
import RecipeModel from '@/models/recipeModel';
import { ReactComponent as Clock } from '@/assets/clock.svg';

type Props = {
    recipe: RecipeModel,
    style?: React.CSSProperties | undefined
    mini?: boolean,
    className?: string
}

export function RecipeCard({ recipe, style, mini, className }: Props) {

    const isLongPress = useRef<boolean>();
    const navigate = useNavigate();
    const timerRef = useRef<NodeJS.Timeout>();


    const openRecipe = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, recipeId: number) => {
        e.preventDefault()
        if (isLongPress.current)
            return;
    
        navigate(`/recipes/${recipeId}`)
    }

    const startPressTimer = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (e.nativeEvent.button !== 0)
            return;
        e.currentTarget.classList.add(styles.selected)

        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
        }, 300);
    }

    const clearPressTimer = (element: HTMLElement) => {
        element.classList.remove(styles.selected)
        clearTimeout(timerRef.current);
    }

    const getCookTime = (recipe: RecipeModel) => {
        var time = recipe?.cookTime.split(':');
        if (!time)
            return `-`

        let hours = time[0]
        let minutes = time[1]
        let finalStr = '';
        if (hours !== '0')
            finalStr += hours + ' ч '
        if (minutes !== '0')
            finalStr += minutes + ' м'

        return finalStr.trim();
    }

    const getIngredientsText = (recipe: RecipeModel) => {
        var finalStr = "";
        recipe.recipeIngredients.forEach(ingredients => {
            finalStr += ingredients.ingredientNavigation.name + ", "
        });

        finalStr = finalStr.slice(0, -2)
        return finalStr
    }

    return (
        <a className={`${styles.recipe_card} ${mini && styles.mini} ${className}`} href={`/recipes/${recipe.id}`} style={style} onClick={(e) => openRecipe(e, recipe.id)} onMouseDown={(e) => startPressTimer(e)} onMouseUp={(e) => clearPressTimer(e.currentTarget)}>
            <div className={styles.flip_card_inner}>
                <div className={styles.recipe_preview}>
                    <div className={styles.recipe_img_container}>
                        <img src={`${ENDPOINTS.IMAGE.GET}?id=${recipe.finishImage}`} alt={recipe.name} />
                        <div className={styles.recipe_time + ' horizontal'}>
                            <Clock height='15px' width='15px'></Clock><p>&nbsp;{getCookTime(recipe)}</p>
                        </div>
                    </div>
                    <p>{recipe.name}</p>
                </div>
                <div className={styles.recipe_info}>
                    <p>Ингредиенты:</p>
                    <p>{getIngredientsText(recipe)}</p>
                </div>
            </div>
        </a>
    );
}