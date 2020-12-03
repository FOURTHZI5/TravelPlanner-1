import React, {Component} from 'react';
import {Tabs, Radio} from 'antd';
import Attraction from './Attraction.js'
import {Button, Input, List, Avatar, Checkbox, Spin} from 'antd';
import axios from 'axios';
import SearchAttractionButton from './SearchAttractionButton.js'
import Marker from "./Marker";
import GoogleMap from "./GoogleMap";

import { LOS_ANGELES_CENTER } from '../const/constant';

const styles = require("../styles/GoogleMapStyle.json");
const { Search } = Input;
const {TabPane} = Tabs;
const count = 3;
const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat&noinfo`;

const fakePlaceName = ["Chrysler Building", "Times Square", "Henry Hudson Bridge", "Lincoln Center for the Performing Arts", "Radio City Music Hall",
                    "Rockefeller Center", "The Museum of Modern Art", "American Museum of Natural History", "Empire State Building", "Solomon R. Guggenheim Museum"];
const fakePlaceId = ["ChIJN0qhSgJZwokRmQJ-MIEQq08", "ChIJmQJIxlVYwokRLgeuocVOGVU", "ChIJtT1iDe_zwokRdUvlbh_VU3Y",
                      "ChIJN6W-X_VYwokRTqwcBnTw1Uk", "ChIJPS8b1vhYwokRldqq2YHmxJI", "ChIJ9U1mz_5YwokRosza1aAk0jM",
                    "ChIJKxDbe_lYwokRVf__s8CPn-o", "ChIJCXoPsPRYwokRsV1MYnKBfaI", "ChIJaXQRs6lZwokRY6EFpJnhNNE", "ChIJmZ5emqJYwokRuDz79o0coAQ"];
const fakePlaceDetail = [{"place_id": "ChIJN0qhSgJZwokRmQJ-MIEQq08","icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","name":"Chrysler Building","url":"https://maps.google.com/?q=Manhattan,+New+York,+NY+10174,+USA&ftid=0x89c259024aa14a37:0x4fab1081307e0299"},{"place_id": "ChIJmQJIxlVYwokRLgeuocVOGVU","icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","name":"Times Square","url":"https://maps.google.com/?cid=6132018978369701678"},{"place_id": "ChIJtT1iDe_zwokRdUvlbh_VU3Y","icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","name":"Lincoln Center for the Performing Arts","url":"https://maps.google.com/?cid=5320422915917524046"},{"place_id": "ChIJN6W-X_VYwokRTqwcBnTw1Uk", "icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","name":"Radio City Music Hall","url":"https://maps.google.com/?cid=10575831270349789845"},{"place_id": "ChIJPS8b1vhYwokRldqq2YHmxJI", "icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","name":"Henry Hudson Bridge","url":"https://maps.google.com/?cid=8526392850523704181"},{"place_id": "ChIJ9U1mz_5YwokRosza1aAk0jM", "icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","name":"Rockefeller Center","url":"https://maps.google.com/?cid=3734087314244816034"},{"place_id": "ChIJKxDbe_lYwokRVf__s8CPn-o", "icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/museum-71.png","name":"The Museum of Modern Art","url":"https://maps.google.com/?cid=16906389583988522837"},{"place_id": "ChIJCXoPsPRYwokRsV1MYnKBfaI", "icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/museum-71.png","name":"American Museum of Natural History","url":"https://maps.google.com/?cid=11708656934508584369"},{"place_id": "ChIJaXQRs6lZwokRY6EFpJnhNNE", "icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","name":"Empire State Building","url":"https://maps.google.com/?cid=15074921902713971043"},{"place_id": "ChIJmZ5emqJYwokRuDz79o0coAQ","icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/museum-71.png","name":"Solomon R. Guggenheim Museum","url":"https://maps.google.com/?cid=333297768485043384"}];

// Return map bounds based on list of places
const getMapBounds = (map, maps, places) => {
    const bounds = new maps.LatLngBounds();

    places.forEach((place) => {
        bounds.extend(new maps.LatLng(
            place.geometry.location.lat,
            place.geometry.location.lng,
        ));
    });
    return bounds;
};

// Re-center map when resizing the window
const bindResizeListener = (map, maps, bounds) => {
    maps.event.addDomListenerOnce(map, 'idle', () => {
        maps.event.addDomListener(window, 'resize', () => {
            map.fitBounds(bounds);
        });
    });
};

// Fit map to its bounds after the api is loaded
const apiIsLoaded = (map, maps, places) => {
    const flightPath = new maps.Polyline({
        path:
            places.map((place) => (
                // 0.002 insets to avoid weird line position
                {lat: place.geometry.location.lat - 0.002, lng: place.geometry.location.lng + 0.002}
            )),
        geodesic: true,
        strokeColor: "#21265f",
        strokeOpacity: 1.0,
        strokeWeight: 3,
    });
    flightPath.setMap(map);

    // Get bounds by our places
    const bounds = getMapBounds(map, maps, places);
    // Fit map to bounds
    map.fitBounds(bounds);
    // Bind the resize listener
    bindResizeListener(map, maps, bounds);
};

class MyTrip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attractionsId: [],
            attractionsName: [],
            attractionsDetail: [],    //used in List to show each candidate attraction
            attractionPlan: [],   //2D array: each element contains all attractions in that day
            mode: 'top',
            dates: [],
            places: [],
            //add from list to plan
            chosenPlace: [],
            activeTab: "1"
        };
    }

    onChange = e => {
      console.log(e);
        const { dataInfo, checked } = e.target;
        const {chosenPlace} = this.state;
        const list = this.addOrRemove(dataInfo, checked, chosenPlace);
        this.setState({ chosenPlace: list })
    }

    addOrRemove = (item, status, list) => {
        const found = list.some( entry => entry.name === item.name);
        if(status && !found){
            list.push(item)
        }

        if(!status && found){
            list = list.filter( entry => {
                return entry.name !== item.name;
            });
        }
        return list;
    }

    // componentDidMount(){
    //   // const dates = this.props.datesList   !!!First
    //   const dates = ["2020-02-01", "2020-02-02", "2020-02-03", "2020-02-04", "2020-02-05"];
    //   this.search(this.props.cityName);
    //   for(var i = 0; i < dates.length; i++){
    //     this.state.attractionPlan.push([]);
    //   }
    // }


    componentDidMount() {
        // this.search("New York");
        fetch('places.json')
            .then((response) => response.json())
            .then((data) => {
                data.results.forEach((result) => {
                    result.show = false; // eslint-disable-line no-param-reassign
                });
                this.setState({places: data.results});
            });
    }

    // onChildClick callback can take two arguments: key and childProps
    onChildEventCallBack = (key) => {
        this.setState((state) => {
            const index = state.places.findIndex((e) => e.id === key);
            state.places[index].show = !state.places[index].show; // eslint-disable-line no-param-reassign
            return {places: state.places};
        });
    };

    search = (place) => {
        const proxy = "https://cors-anywhere.herokuapp.com/";
        const base = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?";
        const API_KEY = "AIzaSyC9yzILpgwBgwf0h4rxnsXh1gNVAe8Jzow";
        const url = `${base}input=${place}&inputtype=textquery&fields=geometry&key=${API_KEY}`;
        const finalUrl = proxy + url;
        axios.get(finalUrl)
            .then(response => {
                const location = response.data.candidates[0].geometry.location;
                // console.log(location);
                this.searchAround(location.lat, location.lng);
            })
            .catch(error => {
                console.log("err in fetch data", error);
            })
    }

    searchAround = (lat, lng) => {
        const type = "tourist_attraction";
        const proxy = "https://cors-anywhere.herokuapp.com/";
        const base = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
        const API_KEY = "AIzaSyC9yzILpgwBgwf0h4rxnsXh1gNVAe8Jzow";
        const url = `${base}location=${lat},${lng}&radius=50000&type=${type}&key=${API_KEY}`;
        const finalUrl = proxy + url;
        axios.get(finalUrl)
            .then(response => {
                // console.log(response);
                const attractions = response.data.results;
                this.updateAroundAttractions(attractions);
            })
            .catch(error => {
                console.log("err in fetch data", error);
            })
    }

    updateAroundAttractions = (attractions) => {
        this.setState({
            attractionsId: attractions.map((attraction) => {
                return attraction.place_id;
            }),
            attractionsName: attractions.map((attraction) => {
                return attraction.name;
            }),
        });
        this.updateAttractionsDetail();
    };

    updateAttractionsDetail = () => {
      const placeID = this.state.attractionsId;
      for(var i = 0; i < placeID.length; i++){
         const proxy = "https://cors-anywhere.herokuapp.com/";
         const base = "https://maps.googleapis.com/maps/api/place/details/json?";
         const API_KEY = "AIzaSyC9yzILpgwBgwf0h4rxnsXh1gNVAe8Jzow";
         const url = `${base}place_id=${placeID[i]}&fields=name,icon,url,place_id&key=${API_KEY}`;
         const finalUrl = proxy + url;

         axios.get(finalUrl)
              .then(response => {
                const each = response.data.result;
                this.setState({
                    attractionsDetail: [...this.state.attractionsDetail, each],
                });
              })
              .catch(err => {
                console.log("err in get detail", err);
              })
        }

      }

    handleModeChange = e => {
        const mode = e.target.value;
        this.setState({mode});
    };

    updatePlan = (chosenAttraction, chosenDate) => {
        //update state
    }

    getRecommendation = () => {

    }

    save = () => {

    }

    changeTab = activeKey => {
      console.log(activeKey);
      this.setState({
        activeTab: activeKey
      });
    }


    render(){
        const {places} = this.state;
        const {mode} = this.state;
        // const dates = this.props.datesList;       !!!!!Second
        const dates = ["2020-02-01", "2020-02-02", "2020-02-03", "2020-02-04", "2020-02-05"];
        // const operations = <SearchAttractionButton places={this.state.attractionsName}/>

        return (
            <div className="mytrip">
                <div className="left-side">
                    <div className="list">
                        <Radio.Group onChange={this.handleModeChange} value={mode} style={{marginBottom: 10}}>
                            <Radio.Button value="top">Horizontal</Radio.Button>
                            <Radio.Button value="left">Vertical</Radio.Button>
                        </Radio.Group>
                        <Tabs tabPosition={mode} activeKey={this.state.activeTab} onChange={this.changeTab}>
                            {[...Array(dates.length).keys()].map(i => (
                                <TabPane tab={dates[i]} key={i}>
                                    <Attraction dayTime={i} attractions={this.state.attractionPlan[i]}/>
                                </TabPane>
                            ))}
                        </Tabs>
                    </div>
                    <div className="button">
                        <Button onClick={this.getRecommendation}> get recommendation</Button>
                        <Button onClick={this.save}> save</Button>
                        <Button> map</Button>
                    </div>
                </div>
                <div className = "right-side">
                  <div className = "search-bar">
                    <Search
                      placeholder="input search text"
                      onSearch={value => console.log(value)}
                      style={{ width: 200 }}
                    />
                  </div>
                  <div>
                    <List
                          className="attraction_list"
                          itemLayout="horizontal"
                          size="small"
                          dataSource={fakePlaceDetail}
                          renderItem={item => (
                              <List.Item
                                  actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                              >
                                  <List.Item.Meta
                                      avatar={<Avatar size={50} src={item.icon} />}
                                      title={<p>{item.name}</p>}
                                      description={`${item.url}`}
                                  />

                              </List.Item>
                          )}
                      />
                  </div>
                  <div className = "addPlanButton">
                    <Button type="primary">add to plan</Button>
                  </div>
                </div>
              </div>
            );
        }
    }
                // <div className="map">
                //     <GoogleMap
                //         defaultZoom={10}
                //         defaultCenter={LOS_ANGELES_CENTER}
                //         options={{
                //             // disableDefaultUI: true, // disable default map UI
                //             draggable: true, // make map draggable
                //             keyboardShortcuts: false, // disable keyboard shortcuts
                //             scaleControl: false, // allow scale controle
                //             disableDoubleClickZoom: true, // disable double click to zoom
                //             scrollwheel: false, // allow scroll wheel
                //             clickableIcons: false, // disable click on landmarks
                //             styles: styles // change default map styles
                //         }}
                //         yesIWantToUseGoogleMapApiInternals
                //         onGoogleApiLoaded={({map, maps}) => apiIsLoaded(map, maps, places)}
                //         // onChildClick={this.onChildClickCallback}
                //         onChildMouseEnter={this.onChildEventCallBack}
                //         onChildMouseLeave={this.onChildEventCallBack}
                //     >
                //         {places.map((place) => (
                //             <Marker
                //                 key={place.id}
                //                 text={place.index}
                //                 lat={place.geometry.location.lat}
                //                 lng={place.geometry.location.lng}
                //                 show={place.show}
                //                 place={place}
                //             />
                //         ))}
                //     </GoogleMap>
                // </div>


export default MyTrip;
