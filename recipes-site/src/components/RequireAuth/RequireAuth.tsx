import { useQuery } from "react-query"
import { Navigate, useLocation } from "react-router-dom"
import { isAuthorized } from "@/utils/auth"

type Props = {
    onOk: JSX.Element
    onFailTo?: string
    inverse?: boolean
    cascadeRedirect?: boolean
    dontRedirect?: boolean
}

export const REDIRECT_QUERY_PARAM_NAME = 'redirect'

export default function RequireAuth({ onOk, onFailTo, inverse, cascadeRedirect, dontRedirect }: Props) {
    const location = useLocation()
    const state = location.state
    let redirect = false
    
    console.log(state)

    if (!onFailTo) {
        onFailTo = `/login?${REDIRECT_QUERY_PARAM_NAME}=${location.pathname}`
    }

    if (!dontRedirect) {
        redirect = true
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

    const nextState = cascadeRedirect ? { ...location.state } : { ...location.state, doNotRedirect: true }

    return isOk
        ? onOk
        : redirect ? <Navigate to={onFailTo} state={nextState} /> : onOk
}