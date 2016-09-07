//mock data
let mockVideoList = {
    "videos": [{
        "vid_id": 1,
        "title": "I'M WINNING",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }, {
        "vid_id": 2,
        "title": "I'M LOSING",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }, {
        "vid_id": 3,
        "title": "IT'S TIED",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }, {
        "vid_id": 4,
        "title": "I'M WINNING AGAIN!!",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }, {
        "vid_id": 5,
        "title": "I'M LOSING AGAIN...",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }, {
        "vid_id": 6,
        "title": "TIED...AGAIN...",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }, {
        "vid_id": 7,
        "title": "IS IT OVER YET???",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }, {
        "vid_id": 8,
        "title": "NOW ITS OVER...",
        "img": "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg",
        "author": "Cool_guy_user",
        "date": "1471567701",
        "game": "Dota 2",
        "link": "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
    }]
}

let mockUserList = {
    "users": [{
        "id": 1,
        "name": "COOL_USER_GUY",
        "videos": mockVideoList.videos,
        "pw": "1234",
        "twitch_id": "5"
    }, {
        "id": 2,
        "name": "fake",
        "videos": [{}],
        "pw": "1234",
        "twitch_id": "6"
    }, {
        "id": 3,
        "name": "throw_away",
        "videos": [{}],
        "pw": "1234",
        "twitch_id": "7"
    }, {
        "id": 4,
        "name": "another_one",
        "videos": [{}],
        "pw": "1234",
        "twitch_id": "8"
    }, {
        "id": 5,
        "name": "smart",
        "videos": [{}],
        "pw": "1234",
        "twitch_id": "9"
    }, {
        "id": 6,
        "name": "loyal",
        "videos": [{}],
        "pw": "1234",
        "twitch_id": "10"
    }]
}

//client
function getTopVideos(callback) {
    setTimeout(() => {
        callback(mockVideoList)
    }, 500)
}

function showVideoList(data) {
    for (let index in data.videos) {
        $('#videos').append('<div class="vid"><a href="#"><img src=' +
            data.videos[index].img + '></a>' +
            '<div class="details-box"><a class="vid-details" href="' +
            data.videos[index].author + '">' +
            data.videos[index].author + '</a>' +
            '<a class="vid-details" href="' + data.videos[index].game + '">' +
            data.videos[index].game + '</a></div>' +
            '<p>' + data.videos[index].title + '</p></div>')
    }
}

function getAndShowVideos() {
    getTopVideos(showVideoList)
}

function loginUser1() {
    showUserData(mockUserList.users[0])
}

function shrinkTitle(title) {
    if (title.length > 12) {
        return title.substring(0, 12) + "..."
    }
    return title
}

function showUserData(user) {
    $('#user-name').html(user.name)
    for (let index in user.videos) {
        appendClip(user.videos[index])
    }
}

function appendClip(clip) {
    $('.myClips').append(
        '<div class="vid-small">'+
        '<i class="fa fa-times-circle" aria-hidden="true"></i>' +
        '<a href="#"><img src=' +
        clip.img +
        '></a><a class="vid-details flex center" href="' + clip.game + '">' +
        clip.game + '</a><p>' +
        shrinkTitle(clip.title) + '</p></div>')
}

function search(searchTerm) {
    $.ajax({
        url: '/search',
        type: 'GET',
        contentType: 'application/json',
        data: searchTerm
    })
    .done(results => {
        $('#videos').html("")
        showVideoList(results)
    })
}

$(() => {
    getAndShowVideos()
    //clip search
    $('#search-button').on('click', event => {
        event.preventDefault()
        console.log('works');
        let searchTerm = {
            q: $('#search').val()
        }
        console.log("front end searchTerm,", searchTerm);
        search(searchTerm)
    })

    //add to myclips
    $('#clip-form').submit(() => {
        let data = {
            title: $('#clip-title-input').val(),
            link: $('#clip-input').val()
        }
        $.ajax({
            url: '/scrape',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        })
        .done(clip => {
            appendClip(clip)
        })

    })
    loginUser1()
    $('.burger').click(() => {
        if ($('.user-panel').css('right') === '0px') {
            $('.user-panel').css('right', '-700px')
        } else {
            $('.user-panel').css('right', '0px')
        }
    })
})
