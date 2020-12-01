import React, {Component} from 'react';
import {Button, DatePicker, Input} from 'antd';
import PlacesAutocomplete from 'react-places-autocomplete';


const {RangePicker} = DatePicker;

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            startDate : '',
            endDate: '',

        };
    }

    addressOnChange = address => {
        this.setState({ address });
    };

    dateOnChange = (dates) => {
        this.setState({
            startDate: dates[0],
            endDate: dates[1]
        })
    };


    searchOnClick = () => {
        const dates = [];
        let i = 0;
        while (true) {
            const copy = this.state.startDate.clone();
            copy.add(i, 'days');
            i++
            if (copy <= this.state.endDate) {
                dates.push(copy);
            }
            else {
                break;
            }
        }

        this.props.update(
            this.state.address,
            dates,

        )
    }

    render() {
       return (
           <div className="container">

               <div className="search-city">
                   <PlacesAutocomplete
                       value={this.state.address}
                       onChange={this.addressOnChange}
                   >

                   {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                       <div>
                           <input
                               {...getInputProps({
                                   placeholder: 'Search City ...',
                                   className: 'location-search-input',
                               })}
                           />
                           <div className="autocomplete-dropdown-container">
                               {loading && <div>Loading...</div>}
                               {suggestions.map(suggestion => {
                                   const className = suggestion.active
                                       ? 'suggestion-item--active'
                                       : 'suggestion-item';
                                   // inline style for demonstration purpose
                                   const style = suggestion.active
                                       ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                       : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                   return (
                                       <div
                                           {...getSuggestionItemProps(suggestion, {
                                               className,
                                               style,
                                           })}
                                       >
                                           <span>{suggestion.description}</span>
                                       </div>
                                   );
                               })}
                           </div>
                       </div>
                   )}
               </PlacesAutocomplete>
               </div>

               <div className="search-date">
                   <RangePicker onChange={this.dateOnChange}></RangePicker>
               </div>

               <div className="search-next-btm">
                   <Button type="primary" onClick={this.searchOnClick}>Next</Button>
               </div>



           </div>
       );
   }
}



export default Search;
