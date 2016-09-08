//client

function getTopVideos() {
    $.ajax({
        url: '/clips',
        type: 'GET',
        contentType: 'application/json'
    })
    .done(results => {
        $('#videos').html("")
        console.log(results)
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
        console.log(results)
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

function showVideoList(data) {
    for (let index in data) {
        $('#videos').append('<div class="vid"><a href="#"><img src=' +
            data[index].img + '></a>' +
            '<div class="details-box"><a class="vid-details" href="' +
            data[index].author + '">' +
            data[index].author + '</a>' +
            '<a class="vid-details" href="' + data[index].game + '">' +
            shortenGameName(data[index]) + '</a></div>' +
            '<p>' + data[index].title + '</p></div>')
    }
}


//user functions

function getUser(){

    $.ajax({
        url: '/account',
        type: 'GET',
        contentType: 'application/json'
    })
    .done(user => {
        showUserData(user)
    })
}

function getMyClips(){
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
    })
}

function showUserData(user) {
    console.log(user, "showuserdata");
    $('#user-name').html(user.username)
    for (let index in user.clips) {
        appendClip(user.clips[index])
    }
}

function appendClip(clip) {
    $('.myClips').append(
        '<div class="vid-small" data-id="'+clip._id+'">'+
        '<a class="del"><i class="fa fa-times-circle" aria-hidden="true"></i></a>' +
        '<a><img src=' + clip.img +
        '></a><a class="vid-details flex center" href="' + clip.game + '">' +
        shortenGameName(clip) + '</a><p>' +
        shrinkTitle(clip.title) + '</p></div>')

    //remove clip
    $('.del').on('click', event => {
        event.preventDefault()
        console.log("clicked")
        let id = $(event.target).parent().parent().data('id')
        console.log(id)
        $.ajax({
            url: '/clips/'+id,
            type: 'DELETE',
            contentType: 'application/json'
        })
        .done(() => {
            $(event.target).parent().parent().remove()
        })
    })
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
        console.log(searchTerm.q);
        search(searchTerm)
    })

    getUser()
    getMyClips()

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

    //mobile user panel
    $('.burger').click(() => {
        if ($('.user-panel').css('right') === '0px') {
            $('.user-panel').css('right', '-700px')
        } else {
            $('.user-panel').css('right', '0px')
        }
    })
})
