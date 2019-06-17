import React, {Component} from 'react';
import {StyleSheet,View,Image,Animated,Easing,Dimensions,TouchableOpacity,Text,ImageBackground} from "react-native";
import {Actions} from "react-native-router-flux";
import {scaleSizeH, scaleSizeW, setSpText}  from '../../utils/Screen';

const { width, height } = Dimensions.get('window');
class Turntable extends Component {

    constructor(props){
        super(props);
        this.state = {
            offOn:true,
            rotateDeg:new Animated.Value(0),
            speed:800,
            _time:0
        };
    }


    rotateImg=()=>{
        if(this.state.offOn){
            this.countTime();
            this.setState({
                offOn:!this.state.offOn,
                rotateDeg:new Animated.Value(0),
            },()=>{
                this.rotateImg();
            });
        }
    };

    rotateImg=()=>{

        let number=Math.ceil(Math.random()*this.state.speed);
        if((number/8)==0.875){
            number=1;
        }
        let  oneTimeRotate=number/8;
        Animated.timing(this.state.rotateDeg, {
            toValue: oneTimeRotate,
            duration: 6000,
            //easing: Easing.out(Easing.linear),
        }).start(()=>{

            this.setState({
                offOn:!this.state.offOn,
            });
            //动画结束时，会把toValue值，回调给callback

            this.state.rotateDeg.stopAnimation((oneTimeRotate)=>{
                this.changeValue(oneTimeRotate);
            })});
    };

    changeValue=(number)=>{

        alert("可以根据"+number+"值，进行相关计算");
    };
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.homeExit} onPress={()=>{Actions.home()}}>
                    <Image source={require('../../img/home/tuichu.png')} style={styles.imgExit}/>
                </Text>
                <Animated.Image
                    source={require('../../img/runtable/bg1.png')}
                    style={[styles.mainImg,{transform: [
                            {
                                rotate: this.state.rotateDeg.interpolate({
                                    inputRange: [0, 0.125,0.25,0.375,0.5,0.625,0.75,0.825,1,1.125,1.25,1.375,1.5,1.625,1.75,1.825,2],
                                    outputRange: ['0deg','45deg','90deg','135deg','180deg','225deg','270deg','315deg','360deg','405deg','450deg','495deg','540deg','585deg','630deg','675deg','720deg']
                                })
                            }]}]}>
                </Animated.Image>
                <TouchableOpacity onPress={()=>{this.rotateImg()}} style={styles.centerPoint}>
                    <Image source={require('../../img/runtable/btn2.png')} style={styles.imgPoint}></Image>
                </TouchableOpacity>

            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D4E9FE',
    },
    imgPoint: {
        width: scaleSizeH(159),
        height: scaleSizeH(205),
    },
    centerPoint: {
        position: 'absolute',
        left: Dimensions.get('window').width / 2 - 40,
        top: 220,
    },
    mainImg: {
        width: Dimensions.get('window').width,
        height: 400,
        alignItems: 'center',
        justifyContent: 'center',
        resizeMode: 'contain',
        position: 'relative',
    },
    homeExit:{
        width:36,
        height:23,
        margin:'5%',
    },
    imgExit:{
        width:40,
        height:40
    },
});
export default Turntable;