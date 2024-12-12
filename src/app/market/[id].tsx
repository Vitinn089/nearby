import { Alert, View, Modal, StatusBar, ScrollView } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import { router, useLocalSearchParams, Redirect } from 'expo-router'
import { useCameraPermissions, CameraView } from 'expo-camera'

import  { Loading } from '@/components/loading'
import { api } from '@/services/api'
import { Cover } from '@/components/market/cover'
import { Details, PropsDetails} from '@/components/market/details'
import { Coupon } from '@/components/market/coupon'
import { Button } from '@/components/button'

type MarketProps = PropsDetails & {
    cover: string
}

export default function Market() {
    const [market, setMarket] = useState<MarketProps>()
    const [isLoading, setIsLoading] = useState(true)
    const [coupon, setCoupon] = useState<string | null>(null)
    const [couponIsFetching, setCouponIsFetching] = useState(false)
    const [isVisibleCameraModal, setIsVisibleCameraModal] = useState(false)

    const qrLock = useRef(false)

    const [permission, requestPermission] = useCameraPermissions()

    const params = useLocalSearchParams<{id: string}>()

    async function fetchMarket() {
        try {
            const { data } = await api.get(`/markets/${params.id}`)
            setMarket(data)
            setIsLoading(false)
        } catch (error) {
            console.log(error)
            Alert.alert("Erro", "Não foi possível carregar os dados", [
                {
                    text: "Ok",
                    onPress: () => router.back()
                }
            ])
        }
    }

    async function handleOpenCamera() {
        try {
            const { granted } = await requestPermission()

            if(!granted) 
                return Alert.alert("Câmera", "Você precisa habilitar o uso da câmera!")

            setIsVisibleCameraModal(true)
            qrLock.current = false
        } catch (error) {
            console.log(error)
            Alert.alert("Câmera", "Não foi possível utilizar a câmera!")
        }
    }

    async function getCoupon(id: string) {
        try {
            setCouponIsFetching(true)

            const { data } = await api.patch(`/coupons/${id}`)

            Alert.alert("Cupom", data.coupon)
            setCoupon(data.coupon)
        } catch (error) {
            console.log(error)
            Alert.alert("Erro","Não foi possível utilizar o cupom!")
        } finally {
            setCouponIsFetching(false)
        }
    }

    function handleUseCoupon(id: string) {
        setIsVisibleCameraModal(false)

        Alert.alert("Cupom", "Não é possível reutilizar um cupom resgatado. Deseja realmente resgatar o cupom?", [
            { style: "cancel", text: "Não"},
            { text: "Sim", onPress: () => getCoupon(id)}
        ])
    }

    useEffect(() => {
        fetchMarket()
        console.log(params.id)
    }, [params.id, coupon])

    if(isLoading)
        return <Loading />

    if(!market)
        return <Redirect href="/home" />
    
    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" hidden={isVisibleCameraModal} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <Cover uri={market?.cover} />
                <Details data={market} />
                {coupon && <Coupon code={coupon} />}
            </ScrollView>

            <View style={{padding: 32}}>
                <Button onPress={handleOpenCamera} >
                    <Button.Title>Ler QRCode</Button.Title>
                </Button>
            </View>

            <Modal style={{flex: 1 }} visible={isVisibleCameraModal} >
                <CameraView 
                    style={{ flex: 1 }} 
                    facing='back'
                    onBarcodeScanned={({data}) => {
                        if(data && !qrLock.current){
                            qrLock.current = true
                            setTimeout(() => handleUseCoupon(data), 500)
                        }
                    }}
                />

                <View style={{ position: "absolute", bottom: 32, left: 32, right: 32}} >
                <Button onPress={() =>setIsVisibleCameraModal(false)} isLoading={couponIsFetching} >
                    <Button.Title>Voltar</Button.Title>
                </Button>
                </View>
            </Modal>
        </View>
    )
}