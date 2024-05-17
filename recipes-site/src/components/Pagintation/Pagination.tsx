import styles from './Pagination.module.css'

type Props = {
    page: number
    changePage?: (page: number) => void
}

export function Pagination(props: Props) {

    const changePage = (delta: number) => {
        var newVal = props.page + delta;
        if (props.changePage && newVal > 0)
            props.changePage(newVal)
    }

    return (
        <div id={styles.pagination}>
            <button className='button' onClick={() => changePage(-1)}>{"<"}</button>
            <p>{props.page}</p>
            <button className='button' onClick={() => changePage(1)}>{">"}</button>
        </div>
    )
}