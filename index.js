import React,{useEffect} from 'react';
import { View, Text, Dimensions, Button, TouchableHighlight } from 'react-native';
import * as Constants from '../../constants/Constants.js';
import Header from '../../components/Header.js';
import TextCustom from '../../components/TextCustom';
import { connect } from 'react-redux';
import * as Utils from '../../Utils.js';
import PlayerGroup from './PlayerGroup.js';
import PlayerGroupGSS from './PlayerGroupGSS.js';
import * as LeaderboardActions from '../../Actions/LeaderboardActions.js';
import WSH from '../../components/WebSocketHandler.js';
window.navigator.userAgent = 'react-native';
import SocketIOClient from 'socket.io-client';
import {readLeaderboardAction, readLatestGSSLeaderboardAction, connectGSSDevice} from '../../Actions/LeaderboardActions.js';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';



var { height, width } = Dimensions.get('window');

class ReportScreen extends React.Component {

    constructor(props, context) {

        super(props, context);
        //this.props.readLatestGSSLeaderboard( this.props.navigation.state.params.scoutid);
        this.props.readLeaderboard();
        //this.props.readLatestGSSLeaderboard();

        let holeindex = this.props.navigation.state.params.holeindex;



        // let group = Utils.getClosestGroupByHole(holeindex, this.props.leaderboard);
        // let groupid = group.id;

        let groupGSSIndex = Utils.getClosestGroupIndexByHoleGSS(holeindex, this.props.leaderboardGSS);
        console.log("leaderbooardGSS FOLLOW", this.props.leaderboardGSS.follow,);// this.props.leaderboardGSS);
        let groupindex = this.props.leaderboardGSS.follow === undefined ? 0 : this.props.leaderboardGSS.follow;
        let group = this.props.leaderboardGSS.groups;
        if (group != undefined) {
            for (var i = 0; i < group.length; i++) {
                if (this.props.leaderboardGSS.groups[i].id === this.props.navigation.state.params.groupid) {
                    groupindex = i;
                }
            }
        }
        if (this.props.leaderboardGSS.groups[groupindex].players[0].currentHole != null) {
            holeindex = this.props.leaderboardGSS.groups[groupindex].players[0].currentHole;
        } else {
            holeindex = this.props.navigation.state.params.holeindex;
        }
        this.state = {
            groupindex,
            holeindex: holeindex,//this.props.navigation.state.params.holeindex, 
            socketMsg:[]
        };
        this.socket = new WebSocket('http://134.209.230.231:8080/gss');
        //console.log(this.socket);
        
        let groupGSS = this.props.leaderboardGSS.groups[groupindex];
        let currentholestatus = this.props.currentholestatus;

        //this.reload(groupGSS.id);
        //this.props.readLatestGSSLeaderboard();

        this.nextHole = this.nextHole.bind(this);
        this.previousGroup = this.previousGroup.bind(this);
        this.nextGroup = this.nextGroup.bind(this);
        this.onPressPlayer = this.onPressPlayer.bind(this);
        this.onPressFollow = this.onPressFollow.bind(this);
        this.openSocketFeed = this.openSocketFeed.bind(this);

        this.onMessage = this.onMessage.bind(this);
        this.onMessagePlayerEvent = this.onMessagePlayerEvent.bind(this);
        this.listenOnWS = this.listenOnWS.bind(this);

    }

    componentDidMount(){
        console.log("DIDMOUNT INDEX");
       // this.socket = new WebSocket('ws://134.209.230.231:8080/gss/');//topic/playerevent/'+this.props.navigation.state.params.groupCode);
       this.listenOnWS(this.onMessagePlayerEvent);
        
        //this.socket.onopen = ({data}) => console.log("OPEN:",data);
     // WSH.connect(this.props.navigation.state.params.groupCode);
    }

    reload(groupid) {
        let url = Constants.GSS_SERVER + "/group/" + groupid;
        console.log("reload group", url);
        fetch(url, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                this.setState({
                    data: responseJson
                })
            })
            .catch((error) => {
                console.error(error);
            });
    }
    /**
     * The classic render method
     */
    render() {

        console.log("LEADERBOARD: ", this.props.leaderboard);
        let groupindex = this.state.groupindex;
        let scoutid = this.props.navigation.state.params.scoutid;
        let holeindex = this.state.holeindex;//this.props.navigation.state.params.holeindex;
        //let leaderboard = this.props.leaderboard
        //let group = leaderboard.groups[groupindex];
        let groupGSS = this.props.leaderboardGSS.groups[groupindex];

        groupGSS.index = groupindex + 1;
        let headertitle = "Walking Scorer";

        let followed = this.props.leaderboardGSS.follow == groupindex;
        console.log("followed", followed, groupindex);
        return (
            <View style={{ flexDirection: 'column', flex: 1, backgroundColor: '#2d2c29', top: 0 }}>
                <Header title={headertitle} />
                <View style={{
                    flexDirection: 'row', width: width, marginTop: 20, justifyContent: 'center',
                    alignItems: 'center'
                }}>
                </View>
                {/*#2d2c29<PlayerGroup holeindex={holeindex} leaderboard={leaderboard} data={group} onPressPlayer={this.onPressPlayer}  onPressPrev={this.previousGroup} onPressNext={this.nextGroup}/>*/}
                <PlayerGroupGSS holeindex={holeindex} data={groupGSS} scoutid={scoutid} followed={followed} nextHole={this.nextHole} onPressPlayer={this.onPressPlayer} openSocketFeed={this.openSocketFeed} onPressPrev={this.previousGroup} onPressNext={this.nextGroup} onPressFollow={this.onPressFollow} />
            </View>);
    }
    onMessagePlayerEvent(e) {
        var initialArray=[];
        var type = JSON.parse(e.body);
        console.log('OnMessagePlayer Event:' + JSON.parse(e.body).id);
        this.state.socketMsg= { ...this.state.socketMsg, type };
        //this.setState({socketMsg:newArray})
        console.log("STAAAAAATE: ",this.state.socketMsg);
        this.props.wsOnMessageAction(JSON.parse(e.body));
      }
    
      onMessage(messageEvent) {
        console.log("on message...", JSON.parse(messageEvent));
        this.props.wsOnMessageAction(messageEvent.data);
      }
    
      listenOnWS(onMessagePlayerEvent) {
          var groupCode = this.props.navigation.state.params.groupCode;
        console.log("Connecting to GSS websocket..");
        
        var client = Stomp.over(createNewWebsocket);
    
        client.connect({}, function (frame) {
          console.log('Connected  GSS websocket: ' + frame);
          client.subscribe('/topic/playerevent/'+groupCode, function (e) {
    
            onMessagePlayerEvent(e);
    
          });
        }, function (message) {
          console.log("GSS Web socket error:" + message);
        });
        client.onmessage = (message) => {
            console.log("ClientonMessage",message);
          };
          client.onclose=(message)=>{
            console.log("WEBSOCKET CLOSE...", message);
          };
      }
    

    previousGroup() {
        let newgroupindex = this.state.groupindex - 1;
        //let groups = this.props.leaderboard.groups;

        if (newgroupindex >= 0) {
            this.setState({ groupindex: newgroupindex });
        }
    }

    nextGroup() {
        let newgroupindex = this.state.groupindex + 1;
        let groups = this.props.leaderboardGSS.groups;
        //let groups = this.props.leaderboard.groups;

        if (newgroupindex < groups.length) {
            this.setState({ groupindex: newgroupindex });
        }
    }

    nextHole(groupId, startHole) {
        console.log(startHole);
        let holeindex = this.state.holeindex + 1;
        //let groups = this.props.leaderboard.groups;

        if (startHole == 1 && holeindex < 19) {
            this.setState({ holeindex: holeindex});
            this.reload(groupId);
        }
        if(startHole == 10){
            if(holeindex == 19){
                holeindex = 1;
                
            }
            this.setState({holeindex:holeindex});
                this.reload(groupId);
        }
       // this.forceUpdate()
    }
    onPressPlayer(player, par) {
        console.log("pressplayer ", player);
        this.props.navigation.navigate("ReportPlayerScreen", { holeindex: this.state.holeindex, player: player, scoutId: this.props.navigation.state.params.scoutid, par:par, groupCode:this.props.navigation.state.params.groupCode});
    }
    openSocketFeed() {
        console.log("pressplayer ", this.props.navigation.state.params.groupCode);

        this.props.navigation.navigate("SocketFeedScreen", { holeindex: this.state.holeindex });

    }
    onPressFollow(groupid) {

        console.log("onPressFollow", groupid);
        var groupindex = 0;
        this.props.leaderboardGSS.groups.forEach(element => {
            if (element.id == groupid) {
                this.props.setFollowGroup(groupindex);
                return;
            } else {
                groupindex++;
            }

        });;


    }
}
function createNewWebsocket(){
    var socket = new SockJS('http://134.209.230.231:8080/gss');
  
    socket.onclose = function () {
  
      console.log('GSS Web socket close');
  
    };
    socket.onerror = function () {
  
      console.log('GSS Web socket error');
  
    };
    return socket;
  }
function mapStateToProps(state) {

    return {
        leaderboard: state.leaderboard,
        leaderboardGSS: state.leaderboardGSS
    }
}

function mapDispatchToProps(dispatch) {
    return {

        setFollowGroup: (groupid) => dispatch(LeaderboardActions.setFollowGroupAction(groupid)),
        wsOnMessageAction: (message) => dispatch(LeaderboardActions.wsOnMessageAction(message)),
        readLeaderboard: () => dispatch(readLeaderboardAction()),
        //readLatestGSSLeaderboard: (scoutId) => dispatch(readLatestGSSLeaderboardAction(scoutId)),
        //readLatestGSSLeaderboard: () => dispatch(readLatestGSSLeaderboardAction()),
        //connectDevice: () => dispatch(connectGSSDevice()),

    }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReportScreen);
