import React, { Component } from "react";
import { LogoutButton, DeleteGigButton, StartButton, FormButton} from "../components/buttons";
import API from "../utils/index";
import { InputBox, TextLabel } from "../components/inputs";
import ProfileRightVenue from "../components/containers/ProfileRightVenue";
import ProfileLeft from "../components/containers/ProfileLeft";
import ResultBox from "../components/cards";
import ResultBox2 from "../components/requestedCards";
// import VenueResultBox from "../components/deletegig";

class VenueProfile extends Component {

  state = {
    description: "",
    genre: "",
    date: "",
    venue: {},
    gigs: [],
    requestedGigs: [],
    bookedGigs: [],
    display: true
  };

  componentDidMount() {
    API.Users.isAuthed().then(res => {
      if(res.data === "false") {
        this.props.history.push("/");
      }
    }).catch(err => console.log(err));
    this.loadVenueInfo();
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    if (this.state.description && this.state.genre && this.state.date) {
      API.Gigs.postGig({
        description: this.state.description,
        genre: this.state.genre,
        date: this.state.date
      })
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }
  };

  loadVenueInfo() {
    API.Venues.getVenueInfo().then(venueProfile => {
      this.setState({
        venue: venueProfile.data
      })
      var id = venueProfile.data.id;
      API.Gigs.getGigs(id).then(gigs => {
        const unbookedGigs = gigs.data.filter(gig => {
          if(gig.ArtistId === null){
            return gig;
          }
        })
        const bookedGigs = gigs.data.filter(gig => {
          if(gig.ArtistId !== null ) {
            return gig;
          }
        })
        this.setState({
          gigs: unbookedGigs,
          bookedGigs: bookedGigs
        })
        API.Requests.getRequestedGigs(id).then(gigsAndTheirArtists => {
          this.setState({
            gigsAndTheirArtists: gigsAndTheirArtists.data
          })
          // console.log(this.state.gigsAndTheirArtists);
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  };

  handleLogout = event => {
    event.preventDefault();
    API.Users.logout()
      .then(res => this.props.history.push("/"))
      .catch(err => console.log(err));
  };

  toggleView = () => {
    this.setState({
      display: !this.state.display
    });
  };

  deleteThisGig = event => {
    var id = event;
    API.Gigs.deleteThisGig(id).then(res => {console.log(res)
      this.loadVenueInfo();
    })
    .catch(err => console.log(err));
  };

  render1 = () => {
    return (
      <div>
        <StartButton id="dis-gigs-btn" label="View Gigs" onClick={this.toggleView} />
        <div className="div" id="display-make-gig-form">
          <div className="main-title">Post A Gig</div>
          <br></br>
          <div className="createGigForm">
            <form>
              <TextLabel for="gig-des">Gig Description:</TextLabel>
              <InputBox type="text" id="gig-des" name="description"
                onChange={this.handleInputChange}
                value={this.state.description}
              />
              <TextLabel for="gig-genre">Genre(s): </TextLabel>
              <InputBox type="text" id="gig-genre" name="genre"
                onChange={this.handleInputChange}
                value={this.state.genre}
              />
              <TextLabel for="gig-date">Date: </TextLabel>
              <InputBox type="text" id="gig-date" name="date" placeholder="MM/DD/YYYY"
                onChange={this.handleInputChange}
                value={this.state.date}
              />
              <FormButton id="gig-create"
                value="Post-Gig"
                className="btn btn-primary btn-lg btn-main"
                label="Post Gig"
                onClick={this.handleFormSubmit}
              />
            </form>
          </div>
        </div>
      </div>
    )
  }

  render2 = () => {
    return(
      <div id = "display-venue-gigs">
        <StartButton id="dis-make-gig-form-btn" label="Make A Gig" onClick={this.toggleView} />
        <div className = "main-title">Live Listings</div>
        <hr className = "divider"></hr>

        {/* This maps out unbooked gigs */}
        <div className = "result-box">
          {this.state.gigs.map(gig => (
          <ResultBox
            src = {this.state.venue.image}
            name = {gig.gigName}
            description = {gig.description}
            genre = {gig.genre}
            date = {gig.date}
          >
          <DeleteGigButton
          dataId={gig.id}
          label={"Delete Gig"}
          onClick={() => this.deleteThisGig(gig.id)}
          />
          </ResultBox>
          ))}
        </div>

        {/* Requested Gigs and their Associated Artists */}
        <div className = "main-title">Requested Gigs</div>
          <div className="row">
          {this.state.gigsAndTheirArtists.map(gig => (
            <div>
              <ResultBox2
              src = {this.state.venue.image}
              name = {gig.gigName}
              description = {gig.description}
              genre = {gig.genre}
              date = {gig.date}
              artists = {gig.PotentialArtist}
              >
              </ResultBox2>
            </div>
            ))}

          </div>

          {/* Booked Gigs */}
          <div className = "main-title">Booked Gigs</div>
          <hr className = "divider"></hr>
          <div className = "result-box">
            {this.state.bookedGigs.map(gig => (
              <ResultBox
                src = {this.state.venue.image}
                name = {gig.gigName}
                description = {gig.description}
                genre = {gig.genre}
                date = {gig.date}
              />          
            ))}
          </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.state.venue.image ? 
          <ProfileLeft image={this.state.venue.image}
          venueName={this.state.venue.venueName}
          email={this.state.venue.email}
          website={this.state.venue.website}
          street_address={this.state.venue.street_address}
          city={this.state.venue.city}
          state={this.state.venue.state}
          zipcode={this.state.venue.zipcode}
          phone={this.state.venue.phone}>
          <LogoutButton onClick={this.handleLogout} />
        </ProfileLeft>
        :
        <ProfileLeft image={"https://via.placeholder.com/150"}
          venueName={this.state.venue.venueName}
          email={this.state.venue.email}
          website={this.state.venue.website}
          street_address = {this.state.venue.street_address}
          city = {this.state.venue.city}
          state = {this.state.venue.state}
          zipcode = {this.state.venue.zipcode}
          phone={this.state.venue.phone}>
          <LogoutButton onClick={this.handleLogout}/>
        </ProfileLeft>
        }

        <ProfileRightVenue >
          {this.state.display ? this.render1() : this.render2()}
        </ProfileRightVenue>
      </div>
    );
  }
}

export default VenueProfile;
