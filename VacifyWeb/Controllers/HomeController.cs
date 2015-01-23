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
                    PeopleManager peopleManager = new PeopleManager(clientContext);
                    PersonProperties personProperties = peopleManager.GetMyProperties();
                    clientContext.Load(personProperties, p => p.DisplayName);
                    clientContext.Load(personProperties, p => p.Email);
                    clientContext.Load(personProperties, p => p.UserProfileProperties);
                    clientContext.ExecuteQuery();

                    PersonProperties managerProperties = null;
                    string managerAccountName = personProperties.UserProfileProperties["Manager"];
                    if (!string.IsNullOrEmpty(managerAccountName))
                    {
                        managerProperties = peopleManager.GetPropertiesFor(managerAccountName);
                        clientContext.Load(managerProperties, p => p.DisplayName);
                        clientContext.ExecuteQuery();
                    }

                    viewModel = new VacationRequestViewModel()
                    {
                        Name = personProperties.DisplayName,
                        PictureUrl = String.Format("{0}_layouts/15/userphoto.aspx?size={1}&accountname={2}", spContext.SPHostUrl, "L", personProperties.Email),
                        Manager = managerProperties != null ? managerProperties.DisplayName : "Lika A Boss!"
                    };
                }
            }

            return View(viewModel);
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
                                    "<Eq>" +
                                        "<FieldRef Name=\"Author\" />" +
                                        "<Value Type=\"Text\">{0}</Value>" +
                                    "</Eq>" +
                                "</Where>" +
                            "</Query>" +
                            "<ViewFields>" +
                                "<FieldRef Name=\"EventDate\" />" +
                                "<FieldRef Name=\"EndDate\" />" +
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
                            RequestBy = spUser.Title,
                            StartDate = ((DateTime)vacationRequest["EventDate"]),
                            EndDate = (DateTime)vacationRequest["EndDate"],
                            Status = ""
                        }).ToList();
                }
            }
            return Json(vacationRequests, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult RequestVacation(List<VacationRequest> vacationRequests)
        {
            if (vacationRequests != null)
            {
                var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
                using (var clientContext = spContext.CreateUserClientContextForSPAppWeb())
                {
                    if (clientContext != null)
                    {
                        List vacationRequestList = clientContext.Web.Lists.GetByTitle("Vacation Requests");

                        foreach (VacationRequest vacationRequest in vacationRequests)
                        {
                            ListItem listItem = vacationRequestList.AddItem(new ListItemCreationInformation());
                            listItem["Title"] = "Vacation Request";
                            listItem["EventDate"] = vacationRequest.StartDate;
                            listItem["EndDate"] = vacationRequest.EndDate;
                            listItem.Update();
                        }

                        clientContext.ExecuteQuery();
                    }
                }
            }
            return new JsonResult();
        }
    }
}
