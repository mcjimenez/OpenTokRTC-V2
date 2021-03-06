!function(exports) {
  'use strict';

  var debug = Utils.debug;

  var numUsrsInRoom = 0;

  var subscriberOptions = {
    height: '100%',
    width: '100%',
    inserMode: 'append',
    showControls: true,
    style: {
      audioLevelDisplayMode: 'on',
      buttonDisplayMode: 'on',
      nameDisplayMode: 'on',
      videoDisabledDisplayMode: 'on'
    }
  };

  var publisherOptions = {
    insertMode: 'append',
    width:'100%',
    height: '100%',
    showControls: true
  };

  var _allHandlers =  {
    'sessionConnected': function(evt) {
      // The page has connected to an OpenTok session.
      // This event is dispatched asynchronously in response to a successful
      // call to the connect() method of a Session object.
      debug.log('!!! room TODO - sessionConnected');
    },
    'connectionCreated': function(evt) {
      // A TODOS CONECTADOS EN SESSION
      // Dispatched when an new client (including your own) has connected to the
      // session, and for every client in the session when you first connect
      // Session object also dispatches a sessionConnected evt when your local
      // client connects
      debug.log('!!! room TODO - connectionCreated');
    },
    'connectionDestroyed': function(evt) {
      // A client, other than your own, has disconnected from the session
      numUsrsInRoom--;
      RoomView.participantsNumber = numUsrsInRoom;
    },
    'sessionDisconnected': function(evt) {
      // The client has disconnected from the session.
      // This event may be dispatched asynchronously in response to a successful
      // call to the disconnect() method of the Session object.
      // The event may also be disptached if a session connection is lost
      // inadvertantly, as in the case of a lost network connection.

      // The default behavior is that all Subscriber objects are unsubscribed
      // and removed from the HTML DOM. Each Subscriber object dispatches a
      // destroyed event when the element is removed from the HTML DOM.
      // If you call the preventDefault() method in the event listener for the
      // sessionDisconnect event, the default behavior is prevented, and you
      // can, optionally, clean up Subscriber objects using your own code.
      numUsrsInRoom--;
      RoomView.participantsNumber = numUsrsInRoom;
    },
    'streamCreated': function(evt) {
      // A new stream, published by another client, has been created on this
      // session. For streams published by your own client, the Publisher object
      // dispatches a streamCreated event. For a code example and more details,
      // see StreamEvent.
      numUsrsInRoom++;
      var subsDiv = RoomView.createSubscriberView(numUsrsInRoom);

      this.subscribe(evt.stream, subsDiv, subscriberOptions, function(error) {
        if (error) {
          debug.error('Error susbscribing new participant. ' + error.message);
        } else {
          debug.log('New subscriber, there are ' + numUsrsInRoom);
          RoomView.participantsNumber = numUsrsInRoom;
        }
      });
    },
    'streamDestroyed': function(evt) {
      // A stream from another client has stopped publishing to the session.
      // The default behavior is that all Subscriber objects that are subscribed
      // to the stream are unsubscribed and removed from the HTML DOM. Each
      // Subscriber object dispatches a destroyed event when the element is
      // removed from the HTML DOM. If you call the preventDefault() method in
      // the event listener for the streamDestroyed event, the default behavior
      // is prevented and you can clean up Subscriber objects using your own
      // code. See Session.getSubscribersForStream().
      // For streams published by your own client, the Publisher object
      // dispatches a streamDestroyed event.
      // For a code example and more details, see StreamEvent.
      debug.log('!!! room TODO - streamDestroyed');
    },
    'streamPropertyChanged': function(evt) {
      // Defines an event dispatched when property of a stream has changed.
      // This can happen in the following conditions:
      // A stream has started or stopped publishing audio or video (see
      // Publisher.publishAudio() and Publisher.publishVideo()). Note that a
      // subscriber's video can be disabled or enabled for reasons other than
      // the publisher disabling or enabling it. A Subscriber object dispatches
      // videoDisabled and videoEnabled events in all conditions that cause the
      // subscriber's stream to be disabled or enabled.
      // The videoDimensions property of the Stream object has changed (see
      // Stream.videoDimensions).
      // The videoType property of the Stream object has changed. This can
      // happen in a stream published by a mobile device. (See Stream.videoType.)
      debug.log('!!!! room TODO - streamPropertyChanged');
    },
    'archiveStarted': function(evt) {
      // Dispatched when an archive recording of the session starts
      debug.log('!!! room TODO - archiveStarted');
    },
    'archiveStopped': function(evt) {
      // Dispatched when an archive recording of the session stops
      debug.log('!!! room TODO - archiveStopped');
    },
    'signal:chat': function(evt) {
      RoomView.toggleChatNotification();
    }
  };

  function getRoomParams() {
    if (!exports.RoomController) {
      throw new Error("Room Controller is not defined. Missing script tag?");
    }
    debug = Utils.debug;

    // pathName should be /room/<roomName>[?username=<userName>]
    debug.log(document.location.pathname);
    debug.log(document.location.search);
    var pathName = document.location.pathname.split('/');

    if (!pathName || pathName.length < 2) {
      debug.log('This should not be happen, it\'s not possible to do a ' +
		'request without /room/<roomName>[?username=<usr>]');
      throw new Error('Invalid path');
    }

    var roomName = '';
    var length = pathName.length;
    if (length > 0) {
      roomName = pathName[length - 1];
    }

    // Recover user identifier
    var search = document.location.search;
    var usrId = '';
    if (search && search.length > 0) {
      search = search.substring(1);
      usrId = search.split('=')[1];
    }
    return {
      username: usrId,
      roomName: roomName
    };
  }

  function getRoomInfo(aRoomParams) {
    return Request.
      getRoomInfo(aRoomParams).
	    then(function(aRoomInfo) {
	      if (!(aRoomInfo && aRoomInfo.token && aRoomInfo.sessionId
	          && aRoomInfo.apiKey && aRoomInfo.username)) {
	        debug.error('Error getRoomParams [' + aRoomInfo +
                      ' without correct response');
	        throw new Error('Error getting room parameters');
	      }
        aRoomInfo.roomName = aRoomParams.roomName;
	      return aRoomInfo;
      });
  }

  var init = function() {
    LazyLoader.dependencyLoad([
      '/js/components/htmlElems.js',
      '/js/helpers/OTHelper.js',
      '/js/roomView.js',
      '/js/chatController.js'
    ]).
    then(getRoomParams).
    then(getRoomInfo).
    then(function(aParams) {
      RoomView.init();
      var usr = aParams.username ?
                  (aParams.username.length > 1000 ?
                   aParams.username.substring(0, 1000) :
                   aParams.username) :
                  '';

      var connect =
        OTHelper.connectToSession.bind(OTHelper, aParams.apiKey,
                                       aParams.sessionId, aParams.token);

      RoomView.userName = usr;
      // Room's name is set by server, we don't need to do this, but
      // perphaps it would be convenient
      // RoomView.roomName = aRoomName;
      RoomView.participantsNumber = 0;

      publisherOptions.name = usr;
      var publish = OTHelper.publish.bind(OTHelper, RoomView.publisherId,
                                          publisherOptions);
      ChatController.
        init(aParams.roomName, usr, _allHandlers).
        then(connect).
        then(publish).
        then(function() {
              RoomView.participantsNumber = ++numUsrsInRoom;
            }).
        catch(function(error) {
          debug.error('Error Connecting to room. ' + error.message);
        });
    });
  };

  var RoomController = {
    init: init
  };

  exports.RoomController = RoomController;

}(this);
