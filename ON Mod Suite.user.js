// ==UserScript==
// @name         ON Mod Suite
// @namespace    http://www.hanalani.org/
// @version      0.3.1
// @description  Collection of mods for Blackbaud ON system
// @author       Scott Yoshimura
// @match        https://hanalani.myschoolapp.com/app/*
// @grant        none
// @run-at       document-end
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* Copyright (C) 2018  Hanalani Schools

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>. */


// Completed Mods:
// - User Module Selector
//      Adds links to user pages for quickly switching between module views
// - People Finder Quick Select
//      Hit enter when searching with People Finder to open the first result.
//      Use number keys 1-9 to select the nth search result
// - Switch Roster to Faculty
//      Class rosters opened in Academics are missing the Send Communication menu.
//      This adds a link to quickly switch between Faculty and Academics view of the roster.

// Notes:
// - Currently does not work on Podium pages
// - Pages won't load when opening links in new tab.  Refresh/Reload will load the page.
//      "Run at" must be set to document-end?

// ----------------------------------------------------------------------------------------
// ---------------------------------------Main Section-------------------------------------
// ----------------------------------------------------------------------------------------

// Check for page hashchanges
// Borrowed from: https://stackoverflow.com/questions/18989345/how-do-i-reload-a-greasemonkey-script-when-ajax-changes-the-url-without-reloadin
var fireOnHashChangesToo    = true;
var pageURLCheckTimer       = setInterval (
    function () {
        if (   this.lastPathStr  !== location.pathname
            || this.lastQueryStr !== location.search
            || (fireOnHashChangesToo && this.lastHashStr !== location.hash)
        ) {
            this.lastPathStr  = location.pathname;
            this.lastQueryStr = location.search;
            this.lastHashStr  = location.hash;
            console.log("hash change");
            setTimeout(gmMain, 100);

        }
    }
    , 111
);


// Load all mods
function gmMain(){

    var strURL = window.location.href

    // User Module Selector

    var strLinks = "Open in: "

    switch(GetModule(strURL))
    {
        case "Core":
            waitForKeyElements("#userName", PostLinkCore)
            break;
        case "Academics":
            waitForKeyElements("h1.bb-tile-header", PostLinkAcademics)
            break;
        case "Enrollment Management":
            waitForKeyElements("#CandidateName", PostLinkEnrollmentManagement)
            break;
        case "Faculty":
            waitForKeyElements(".bb-page-heading", PostLinkFaculty)
            break;
        case "Academics-Roster":
            waitForKeyElements(".bb-page-heading", PostLinkRosterFaculty)
            break;
        case "Faculty-Roster":
            waitForKeyElements(".bb-page-heading", PostLinkRosterAcademics)
            break;
    }

    // People Finder Quick Select
    waitForKeyElements("#people-finder-search-box", PeopleFinderQuickSelect)

}


function GetModule(strURL)
{

    if (strURL.substring(0, 41).toLowerCase() == "https://hanalani.myschoolapp.com/app/core")
    {
        return "Core";
    } else if (strURL.substring(0, 60) == "https://hanalani.myschoolapp.com/app/academics#academicclass" && strURL.substring(73, 79) == "roster")
    {
        return "Academics-Roster";
    } else if (strURL.substring(0, 58) == "https://hanalani.myschoolapp.com/app/faculty#academicclass" && strURL.substring(71, 77) == "roster")
    {
        return "Faculty-Roster";
    } else if (strURL.substring(0, 46) == "https://hanalani.myschoolapp.com/app/academics")
    {
        return "Academics";
    } else if (strURL.substring(0, 58) == "https://hanalani.myschoolapp.com/app/enrollment-management")
    {
        return "Enrollment Management";
    } else if (strURL.substring(0, 44) == "https://hanalani.myschoolapp.com/app/faculty")
    {
        return "Faculty";
    }

    return;
}


// ----------------------------------------------------------------------------------------
// -----------------------------------User Module Selector---------------------------------
// ----------------------------------------------------------------------------------------

function PostLinkCore(jNode)
{
    var strURL = window.location.href
    var strLinks = "Open in: "
    var strID = GetID(strURL);
    if(strID == null || strID.length != 7){
        return;
    }

    strLinks = strLinks.concat(GetLink("Academics", strID));
    strLinks = strLinks.concat(GetLink("Enrollment Management", strID));
    strLinks = strLinks.concat(GetLink("Faculty", strID));
    jNode.append(strLinks);
    return;
}

function PostLinkAcademics(jNode)
{
    var strURL = window.location.href
    var strLinks = "Open in: "
    var strID = GetID(strURL);
    if(strID == null || strID.length != 7){
        return;
    }

    strLinks = strLinks.concat(GetLink("Core", strID));
    strLinks = strLinks.concat(GetLink("Enrollment Management", strID));
    strLinks = strLinks.concat(GetLink("Faculty", strID));
    jNode.after(strLinks);
    return;
}

function PostLinkEnrollmentManagement(jNode)
{
    var strURL = window.location.href
    var strLinks = "Open in: "
    var strID = GetID(strURL);
    if(strID == null || strID.length != 7){
        return;
    }

    strLinks = strLinks.concat(GetLink("Core", GetID(strURL)));
    strLinks = strLinks.concat(GetLink("Academics", GetID(strURL)));
    strLinks = strLinks.concat(GetLink("Faculty", strID));
    jNode.append(strLinks);
    return;
}

function PostLinkFaculty(jNode)
{
    var strURL = window.location.href
    var strLinks = "Open in: "
    var strID = GetID(strURL);
    if(strID == null || strID.length != 7){
        return;
    }

    strLinks = strLinks.concat(GetLink("Core", GetID(strURL)));
    strLinks = strLinks.concat(GetLink("Academics", GetID(strURL)));
    strLinks = strLinks.concat(GetLink("Enrollment Management", strID));
    jNode.after(strLinks);
    return;
}

function GetLink(strModule, strID)
{
    var strHTMLPrefix = '<a href="';
    var strHTMLSuffix = '">[';
    var strHTMLSuffix2 = ']</a>  ';
    var strLinkPrefix;
    var strLinkSuffix;

    switch(strModule)
    {
        case "Core":
            strLinkPrefix = "https://hanalani.myschoolapp.com/app/Core#userprofile/";
            strLinkSuffix = "/access";
            break;
        case "Academics":
            strLinkPrefix = "https://hanalani.myschoolapp.com/app/academics#academicprofile/";
            strLinkSuffix = "/attendance";
            break;
        case "Enrollment Management":
            strLinkPrefix = "https://hanalani.myschoolapp.com/app/enrollment-management#candidate/";
            strLinkSuffix = "/contracts";
            break;
        case "Faculty":
            strLinkPrefix = "https://hanalani.myschoolapp.com/app/faculty#profile/";
            strLinkSuffix = "/progress";
            break;
        case "Faculty-Roster":
            strLinkPrefix = "https://hanalani.myschoolapp.com/app/faculty#academicclass/";
            strLinkSuffix = "/0/roster";
            strModule = "Faculty";
            break;
        case "Academics-Roster":
            strLinkPrefix = "https://hanalani.myschoolapp.com/app/academics#academicclass/";
            strLinkSuffix = "/0/roster";
            strModule = "Academics";
    }

    var strLinkFull = strHTMLPrefix.concat(strLinkPrefix, strID, strLinkSuffix, strHTMLSuffix, strModule, strHTMLSuffix2);
    return strLinkFull;
}

function GetID(strURL)
{

    var strParts = strURL.split("/");
    var arrayLength = strParts.length;

    for (var i = 0; i < arrayLength; i++)
    {
        if (isInt(strParts[i]))
        {
            return strParts[i];
        }
    }
    return;
}


// ----------------------------------------------------------------------------------------
// ------------------------------People Finder Quick Select--------------------------------
// ----------------------------------------------------------------------------------------

function PeopleFinderQuickSelect(jNode)
{
    $("#people-finder-search-box").keypress(function (e){
        console.log(e.keyCode);
        switch (e.keyCode)
        {
            case 13:
            case 49:
                $(".pf-user").eq(0).click();
                break;
            case 50:
                $(".pf-user").eq(1).click();
                break;
            case 51:
                $(".pf-user").eq(2).click();
                break;
            case 52:
                $(".pf-user").eq(3).click();
                break;
            case 53:
                $(".pf-user").eq(4).click();
                break;
            case 54:
                $(".pf-user").eq(5).click();
                break;
            case 55:
                $(".pf-user").eq(6).click();
                break;
            case 56:
                $(".pf-user").eq(7).click();
                break;
            case 57:
                $(".pf-user").eq(8).click();
        }

    })
}

// ----------------------------------------------------------------------------------------
// ------------------------------Switch Roster to Faculty----------------------------------
// ----------------------------------------------------------------------------------------

function PostLinkRosterFaculty(jNode)
{
    var strURL = window.location.href
    var strLinks = "Switch to: "
    var strID = GetID(strURL);
    if(strID == null || strID.length != 9){
        return;
    }

    strLinks = strLinks.concat(GetLink("Faculty-Roster", GetID(strURL)));
    jNode.after(strLinks);
    return;
}

function PostLinkRosterAcademics(jNode)
{
    var strURL = window.location.href
    var strLinks = "Switch to: "
    var strID = GetID(strURL);
    if(strID == null || strID.length != 9){
        return;
    }

    strLinks = strLinks.concat(GetLink("Academics-Roster", GetID(strURL)));
    jNode.after(strLinks);
    return;
}

// ----------------------------------------------------------------------------------------
// -----------------------------------Misc. Helper Functions-------------------------------
// ----------------------------------------------------------------------------------------

function isInt(value) {
  if (isNaN(value)) {
    return false;
  }
  var x = parseFloat(value);
  return (x | 0) === x;
}
