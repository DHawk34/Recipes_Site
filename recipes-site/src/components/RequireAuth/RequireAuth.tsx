import { useQuery } from "react-query"
import { Navigate, useLocation } from "react-router-dom"
import { isAuthorized } from "@/utils/auth"

type Props = {
    onOk: JSX.Element
    onFailTo?: string
    inverse?: boolean
    cascadeRedirect?: boolean
}

export const REDIRECT_QUERY_PARAM_NAME = 'redirect'

export default function RequireAuth({ onOk, onFailTo, inverse, cascadeRedirect }: Props) {
    const location = useLocation()
    const state = location.state

    if (!onFailTo) {
        onFailTo = `/login?${REDIRECT_QUERY_PARAM_NAME}=${location.pathname}`
    }

    const { data, isLoading, isFetching } = useQuery(['isAuthorized', onFailTo], isAuthorized, {
        retry: false,
        enabled: !(state?.doNotRedirect)
    })

    if (state?.doNotRedirect) return onOk
    if (isLoading || isFetching) return null

    const isOk = inverse ? !data : data
    // console.log(isOk)
    // console.log('fetching... redirect: ', redirect)
    // console.log(!isOk)

    const nextState = cascadeRedirect ? null : { doNotRedirect: true }

    return isOk
        ? onOk
        : <Navigate to={onFailTo} state={nextState} />
}