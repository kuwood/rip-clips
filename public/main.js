//client

function getTopVideos() {
    $.ajax({
            url: '/clips',
            type: 'GET',
            contentType: 'application/json'
        })
        .done(results => {
            $('#videos').html("")
            showVideoList(results)
        })
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

function shortenGameName(clip) {
    game = clip.game.replace(/\s/g, '')
    if (game === "Counter-Strike:GlobalOffensive") {
        game = "CS:GO"
        return game
    } else {
        return clip.game
    }
}

function shrinkTitle(title) {
    if (title.length > 12) {
        return title.substring(0, 12) + "..."
    }
    return title
}

function slugLinkClosure(slugLink) {
    return () => {
        //let slugLink = slugLink
        let frame = `<iframe src="https://clips.twitch.tv/embed?clip=${slugLink}&autoplay=false" height="360" width="640" frameborder="0" scrolling="no" allowfullscreen="true"><iframe>`
        frame = $(frame)
        $('.overlay-content').append(frame)
        openOverlay()
        return slugLink
    }
}

function showVideoList(data) {
    for (let index in data) {
        let clipElement = `<div class="vid"><a class="overlay-link"><img src='${data[index].img}'></a><p class="vid-title">${data[index].title}</p><div class="details-box"><a class="vid-details game">${shortenGameName(data[index])}</a><a class="vid-details author">${data[index].author}</a></div></div>`
        console.log(clipElement, "showvid for loop");

        clipElement = $(clipElement)
        clipElement.click(slugLinkClosure(data[index].link.substring(24)))
        $('#videos').append(clipElement)

    }

    $('.closebtn').on('click', event => {
        $('iframe').remove()
        closeOverlay()
    })

}


//user functions

function getUser() {

    $.ajax({
            url: '/account',
            type: 'GET',
            contentType: 'application/json'
        })
        .done(user => {
            console.log(user.username);
            showUserData(user)
        })
}

function getMyClips() {
    $.ajax({
            url: '/myClips',
            type: 'GET',
            contentType: 'application/json'
        })
        .done(clips => {
            for (let index in clips) {
                shortenGameName(clips[index])
                appendClip(clips[index])
            }

            $('.closebtn').on('click', event => {
                $('iframe').remove()
                closeOverlay()
            })
        })
}

function showUserData(user) {
    $('#user-name').html(user.username)
    console.log(user.username)
        // for (let index in user.clips) {
        //     appendClip(user.clips[index])
        // }
}

function appendClip(clip) {
    let clipElement = `<div class="vid-small">
                        <a class="del"><i class="fa fa-times-circle" aria-hidden="true"></i></a>
                        <a class="overlay-myclips-link" >
                        <img src="${clip.img}"></a>
                        <p class="vid-title">${shrinkTitle(clip.title)}</p>
                        <a class="vid-details flex white">${shortenGameName(clip)}</a></div>`
    clipElement = $(clipElement)
    clipElementLink = $(clipElement).find('.overlay-myclips-link')
    clipElementLink.click(slugLinkClosure(clip.link.substring(24)))
    $('.myClips').append(clipElement)

    //remove clip
    $('.del').on('click', event => {
        event.preventDefault()
        let id = clip._id
        $.ajax({
                url: '/clips/' + id,
                type: 'DELETE',
                contentType: 'application/json'
            })
            .done(() => {
                $(event.target).parent().parent().remove()
            })
    })
}



function openOverlay() {
    document.getElementById("vid-overlay").style.height = "100%";
}

function closeOverlay() {
    document.getElementById("vid-overlay").style.height = "0%";
}

//doc ready

$(() => {
    getTopVideos()

    //clip search
    $('.fa-search').on('click', event => {
        event.preventDefault()
        let searchTerm = {
            q: $('.main-search').val()
        }
        search(searchTerm)
    })
    $(".main-search").keypress(event => {
        if (event.which == 13) {
            event.preventDefault()
            let searchTerm = {
                q: $('.main-search').val()
            }
            search(searchTerm)
        }
    });

    getUser()
    getMyClips()

    //add to myclips
    $('#clip-form').submit((e) => {
        e.preventDefault()
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
                console.log('appending', clip);
                appendClip(clip)
            })

    })

    //mobile user panel
    $('.burger').click(() => {
        if ($('.user-panel').css('right') === '0px') {
            $('.user-panel').css('right', '-700px')
        } else {
            $('.user-panel').css('right', '0px')
        }
    })
})
