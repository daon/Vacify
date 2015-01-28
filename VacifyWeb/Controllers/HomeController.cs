using Microsoft.SharePoint.Client;
using Microsoft.SharePoint.Client.UserProfiles;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using VacifyWeb.Models;
using VacifyWeb.ViewModels;

namespace VacifyWeb.Controllers
{
    public class HomeController : BaseController
    {
        [SharePointContextFilter]
        public ActionResult Index()
        {
            VacationRequestViewModel viewModel = null;
            var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
            ViewBag.SPHostUrl = spContext.SPHostUrl;

            using (var clientContext = spContext.CreateUserClientContextForSPHost())
            {
                if (clientContext != null)
                {
                    PersonProperties userProperties = LoadUserProperties(clientContext);
                    clientContext.ExecuteQuery();

                    PersonProperties managerProperties = LoadManagerProperties(clientContext, userProperties);
                    if (managerProperties != null) clientContext.ExecuteQuery();

                    viewModel = new VacationRequestViewModel()
                    {
                        Name = userProperties.DisplayName,
                        PictureUrl = String.Format("{0}_layouts/15/userphoto.aspx?size={1}&accountname={2}", 
                                        spContext.SPHostUrl, "L", userProperties.Email),
                        Manager = managerProperties != null ? managerProperties.DisplayName : "Lika A Boss!"
                    };
                }
            }

            return View(viewModel);
        }

        public ActionResult AddVacationRequest()
        {
            return View();
        }

        public ActionResult EditVacationRequest()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetVacationRequests()
        {
            List<VacationRequest> vacationRequests = new List<VacationRequest>();
            var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
            using (var clientContext = spContext.CreateUserClientContextForSPAppWeb())
            {
                if (clientContext != null)
                {
                    User spUser = clientContext.Web.CurrentUser;
                    clientContext.Load(spUser, user => user.Title);
                    clientContext.ExecuteQuery();

                    List vacationRequestList = clientContext.Web.Lists.GetByTitle("Vacation Requests");
                    CamlQuery query = new CamlQuery();
                    query.ViewXml = String.Format(
                        "<View>" +
                            "<Query>" +
                                "<Where>" +
                                    "<Or>" +
                                        "<Eq>" +
                                            "<FieldRef Name=\"RequestBy\" />" +
                                            "<Value Type=\"Text\">{0}</Value>" +
                                        "</Eq>" +
                                        "<Eq>" +
                                            "<FieldRef Name=\"Approver\" />" +
                                            "<Value Type=\"Text\">{0}</Value>" +
                                        "</Eq>" +
                                    "</Or>" +
                                "</Where>" +
                            "</Query>" +
                            "<ViewFields>" +
                                "<FieldRef Name=\"StartDate\" />" +
                                "<FieldRef Name=\"_EndDate\" />" +
                                "<FieldRef Name=\"RequestBy\" />" +
                                "<FieldRef Name=\"Approver\" />" +
                                "<FieldRef Name=\"Status\" />" +
                            "</ViewFields>" +
                            "<RowLimit>100</RowLimit>" +
                        "</View>",
                    spUser.Title);

                    ListItemCollection vacationRequestItems = vacationRequestList.GetItems(query);
                    clientContext.Load(vacationRequestItems);
                    clientContext.ExecuteQuery();

                    vacationRequests = vacationRequestItems
                        .Select(vacationRequest => new VacationRequest()
                        {
                            ID = ((int)vacationRequest["ID"]),
                            Title = vacationRequest["Status"].ToString() + " Request",
                            StartDate = ((DateTime)vacationRequest["StartDate"]),
                            EndDate = (DateTime)vacationRequest["_EndDate"],
                            RequestBy = vacationRequest["RequestBy"].ToString(),
                            Approver = vacationRequest["Approver"].ToString(),
                            Status = vacationRequest["Status"].ToString()
                        }).ToList();
                }
            }
            return Json(vacationRequests, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SaveVacationRequests(List<VacationRequest> vacationRequests)
        {
            if (vacationRequests != null)
            {
                var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
                using (var clientContext = spContext.CreateUserClientContextForSPAppWeb())
                {
                    if (clientContext != null)
                    {
                        PersonProperties userProperties = LoadUserProperties(clientContext);
                        clientContext.ExecuteQuery();

                        PersonProperties managerProperties = LoadManagerProperties(clientContext, userProperties);
                        if (managerProperties != null) clientContext.ExecuteQuery();

                        List vacationRequestList = clientContext.Web.Lists.GetByTitle("Vacation Requests");

                        foreach (VacationRequest vacationRequest in vacationRequests)
                        {
                            ListItem listItem = vacationRequestList.AddItem(new ListItemCreationInformation());
                            listItem["StartDate"] = vacationRequest.StartDate;
                            listItem["_EndDate"] = vacationRequest.EndDate;
                            listItem["RequestBy"] = userProperties.DisplayName;
                            listItem["Approver"] = managerProperties != null ? managerProperties.DisplayName : "Lika A Boss!";
                            listItem["Status"] = "Pending";
                            listItem.Update();
                        }

                        clientContext.ExecuteQuery();
                    }
                }
            }
            return new JsonResult();
        }

        private PersonProperties LoadUserProperties(ClientContext clientContext)
        {
            PeopleManager peopleManager = new PeopleManager(clientContext);
            PersonProperties personProperties = peopleManager.GetMyProperties();
            clientContext.Load(personProperties, p => p.DisplayName);
            clientContext.Load(personProperties, p => p.Email);
            clientContext.Load(personProperties, p => p.UserProfileProperties);

            return personProperties;
        }

        private PersonProperties LoadManagerProperties(ClientContext clientContext, PersonProperties userProperties)
        {
            PeopleManager peopleManager = new PeopleManager(clientContext);
            PersonProperties managerProperties = null;
            string managerAccountName = userProperties.UserProfileProperties["Manager"];
            if (!string.IsNullOrEmpty(managerAccountName))
            {
                managerProperties = peopleManager.GetPropertiesFor(managerAccountName);
                clientContext.Load(managerProperties, p => p.DisplayName);
            }

            return managerProperties;
        }
    }
}
